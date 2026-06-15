#!/usr/bin/env python3
"""Daily news crawl.

Flow:
  1. Fetch all RSS feeds → collect entries (deduplicate by URL)
  2. Extract full text with trafilatura (skip short/articles)
  3. LLM classifies articles into 5 categories
  4. Pick best article per category
  5. LLM translates + generates cloze blanks for each
  6. edge-tts generates MP3 audio
  7. Output public/data/daily-practice/data.json + article-N.mp3
"""

import asyncio
import json
import os
import random
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree

import trafilatura
from openai import OpenAI
import edge_tts

from cfg import (
    RSS_FEEDS, CATEGORIES,
    MAX_PER_FEED,
    OUTPUT_DIR, MIN_TEXT_LENGTH,
    BLANKS_MIN, BLANKS_MAX,
    DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, TTS_VOICE,
)

BEIJING_TZ = timezone(timedelta(hours=8))


# ======================================================================
# RSS fetching
# ======================================================================

def fetch_rss(url: str) -> list[dict]:
    """Download and parse an RSS/Atom feed. Returns list of {title, url, source, summary}."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            print(f"  [WARN] Empty: {url}")
            return []
    except Exception as e:
        print(f"  [WARN] Failed: {url} — {e}")
        return []

    try:
        root = ElementTree.fromstring(downloaded)
    except ElementTree.ParseError:
        print(f"  [WARN] Invalid XML: {url}")
        return []

    source = _guess_source(url)
    entries: list[dict] = []

    for item in root.iter("item"):
        e = _parse_rss_item(item, source)
        if e["url"]:
            entries.append(e)

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    for entry_elem in root.iter("entry"):
        e = _parse_atom_entry(entry_elem, ns, source)
        if e["url"]:
            entries.append(e)

    return entries


def _guess_source(url: str) -> str:
    domain = urlparse(url).netloc.lower()
    for name in ["cgtn", "chinadaily", "globaltimes", "xinhuanet", "sixthtone", "shine"]:
        if name in domain:
            return name.upper() if name == "cgtn" else name.replace(".", " ").title()
    if "ecns" in domain:
        return "ECNS"
    if "technode" in domain:
        return "TechNode"
    return domain


def _parse_rss_item(item, source: str) -> dict:
    title = (item.findtext("title") or "").strip()
    link = (item.findtext("link") or "").strip()
    summary = (item.findtext("description") or "").strip()
    if summary:
        summary = _strip_html(summary)
    if not link:
        return {"title": title, "url": "", "source": source, "summary": summary}
    if link.startswith("//"):
        link = "https:" + link
    link = link.replace(" ", "%20")
    return {"title": title, "url": link, "source": source, "summary": summary}


def _parse_atom_entry(entry, ns: dict, source: str) -> dict:
    title = (entry.findtext("atom:title", namespaces=ns) or "").strip()
    link_el = entry.find("atom:link", namespaces=ns)
    link = ""
    if link_el is not None:
        link = link_el.get("href", "").strip()
    summary = (entry.findtext("atom:summary", namespaces=ns) or "").strip()
    if summary:
        summary = _strip_html(summary)
    return {"title": title, "url": link, "source": source, "summary": summary}


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]*>", "", text).strip()


# ======================================================================
# Text extraction
# ======================================================================

def extract_text(url: str) -> str | None:
    """Download article page and extract clean text with trafilatura."""
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None
    except Exception:
        return None

    text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
    if not text or len(text) < MIN_TEXT_LENGTH:
        return None
    return text


# ======================================================================
# LLM client
# ======================================================================

def build_client() -> OpenAI:
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise RuntimeError("DEEPSEEK_API_KEY env var not set")
    return OpenAI(api_key=api_key, base_url=DEEPSEEK_BASE_URL)


def call_llm(client: OpenAI, system_prompt: str, user_msg: str, max_tokens: int = 4096) -> str | None:
    """Call DeepSeek, return content string or None on failure."""
    try:
        resp = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            max_tokens=max_tokens,
            temperature=0.3,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ],
        )
    except Exception as e:
        print(f"    [ERROR] LLM call failed: {e}")
        return None
    return resp.choices[0].message.content or ""


def parse_json_response(content: str) -> dict | None:
    """Parse LLM response as JSON, stripping markdown fences."""
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```\w*\n?", "", content)
        content = re.sub(r"\n```\s*$", "", content)
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"    [ERROR] JSON parse failed: {e}")
        print(f"    Raw (first 300 chars): {content[:300]}")
        return None


# ======================================================================
# Phase 3: Label top 5 articles with categories
# ======================================================================

LABEL_PROMPT = f"""You are a news classifier. Given 5 articles, assign each ONE category label.

Available categories: {', '.join(CATEGORIES)}

Rules:
- Choose the MOST appropriate category based on the article's main topic
- Each article gets exactly one label
- Military = defense, geopolitics, conflicts, security
- Society = social issues, environment, culture, health, lifestyle
- Education = schools, learning, academic research, training
- Sports = athletics, competitions, games, fitness
- Technology = science, innovation, digital, engineering, AI

Return ONLY valid JSON:
{{
  "labels": [
    {{"index": 0, "category": "technology"}},
    {{"index": 1, "category": "society"}}
  ]
}}"""


def label_articles(client: OpenAI, articles: list[dict]) -> list[str]:
    """Label each article with a category. Returns list of category strings, same order."""
    lines = []
    for i, a in enumerate(articles):
        lines.append(f"[{i}] {a['title']}\n  {a.get('summary', '')[:200]}\n")
    user_msg = "\n".join(lines)

    content = call_llm(client, LABEL_PROMPT, user_msg, max_tokens=1024)
    if not content:
        return ["society"] * len(articles)  # fallback

    result = parse_json_response(content)
    if not result or "labels" not in result:
        return ["society"] * len(articles)

    # Build category list by index
    labels = ["society"] * len(articles)
    for item in result["labels"]:
        idx = item.get("index", -1)
        cat = item.get("category", "society").lower()
        if 0 <= idx < len(articles) and cat in CATEGORIES:
            labels[idx] = cat

    return labels


# ======================================================================
# Phase 2: Translate + cloze blanks for a single article
# ======================================================================

TRANSLATE_PROMPT = """You are an IELTS exercise designer and Chinese translator.

Given an English news article:
1. Translate the title to Chinese.
2. Write a one-sentence Chinese summary.
3. Select {blank_count} important words to blank out for a cloze listening exercise.

Rules for word selection:
- Choose IELTS-level vocabulary: nouns, verbs, adjectives, adverbs
- Each selected word MUST appear exactly as-is in the original text
- Provide the EXACT form found in the text
- For each blank, give a short Chinese hint (e.g., "v. 包含", "n. 影响")
- Assign difficulty: "easy", "medium", or "hard"

Return ONLY valid JSON:
{{
  "titleCn": "中文标题",
  "summaryCn": "一句中文摘要",
  "blanks": [
    {{"word": "exactWordFromText", "hint": "v. 中文提示", "difficulty": "medium"}}
  ]
}}"""


def process_article(client: OpenAI, article: dict) -> dict | None:
    """Translate article + generate blanks. Returns processed article dict or None."""
    text = article["text"]
    title = article["title"]
    blank_count = random.randint(BLANKS_MIN, BLANKS_MAX)

    content = call_llm(client, TRANSLATE_PROMPT.format(blank_count=blank_count),
                       f"Title: {title}\n\nArticle text:\n{text}")
    if not content:
        return None

    result = parse_json_response(content)
    if not result or "blanks" not in result or not result["blanks"]:
        print(f"    [ERROR] LLM returned no blanks")
        return None

    # Build paragraphs and insert blanks
    paragraphs = _build_paragraphs(text, result["blanks"])

    return {
        "titleCn": result.get("titleCn", ""),
        "summaryCn": result.get("summaryCn", ""),
        "paragraphs": paragraphs["paragraphs"],
        "blanks": paragraphs["blanks"],
    }


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]


def _build_paragraphs(text: str, raw_blanks: list[dict]) -> dict:
    """Split text into paragraphs, insert {{id}} markers for blanks."""
    sentences = _split_sentences(text)
    # Group sentences into paragraphs (~3-5 sentences each)
    para_chunks = []
    chunk_size = max(3, len(sentences) // max(1, len(sentences) // 5))
    for i in range(0, len(sentences), chunk_size):
        chunk = ' '.join(sentences[i:i + chunk_size])
        if chunk:
            para_chunks.append(chunk)

    # Normalize blanks
    blanks = []
    for i, b in enumerate(raw_blanks):
        word = b.get("word", "")
        if not word:
            continue
        blanks.append({
            "id": i,
            "answer": word,
            "hint": b.get("hint", ""),
            "difficulty": b.get("difficulty", "medium"),
        })

    # Insert blank markers
    used = []
    consumed: set[str] = set()
    for b in blanks:
        word = b["answer"]
        if word.lower() in consumed:
            continue
        pattern = re.compile(r"\b" + re.escape(word) + r"\b")
        placed = False
        for pi in range(len(para_chunks)):
            if pattern.search(para_chunks[pi]):
                para_chunks[pi] = pattern.sub(f"{{{{{b['id']}}}}}", para_chunks[pi], count=1)
                used.append(b)
                consumed.add(word.lower())
                placed = True
                break
        if not placed:
            print(f"    [WARN] Could not place '{word}' in text, skipping")

    # Re-index
    for i, b in enumerate(used):
        b["id"] = i

    return {
        "paragraphs": [{"en": p, "cn": ""} for p in para_chunks],
        "blanks": used,
    }


# ======================================================================
# Audio generation
# ======================================================================

async def generate_audio(text: str, output_path: Path) -> bool:
    try:
        communicate = edge_tts.Communicate(text, TTS_VOICE)
        await communicate.save(str(output_path))
        return True
    except Exception as e:
        print(f"    [ERROR] edge-tts: {e}")
        return False


# ======================================================================
# Orchestration
# ======================================================================

async def main():
    print("=" * 60)
    print(f"Daily News Crawl — {datetime.now(BEIJING_TZ).strftime('%Y-%m-%d %H:%M:%S')} Beijing")
    print("=" * 60)

    repo_root = Path(__file__).resolve().parent.parent.parent
    output_dir = repo_root / OUTPUT_DIR
    _clear_dir(output_dir)

    client = build_client()

    # ---- Step 1: Fetch all RSS entries ----
    print("\n[Phase 1] Fetching RSS feeds...")
    all_entries: list[dict] = []
    seen_urls: set[str] = set()

    for feed_url in RSS_FEEDS:
        entries = fetch_rss(feed_url)
        new_count = 0
        for e in entries[:MAX_PER_FEED]:
            if e["url"] and e["url"] not in seen_urls:
                seen_urls.add(e["url"])
                all_entries.append(e)
                new_count += 1
        print(f"  {e['source'] if entries else '?'}: {len(entries)} entries, {new_count} new")

    print(f"  Total unique entries: {len(all_entries)}")

    # ---- Step 2: Extract full text ----
    print("\n[Phase 2] Extracting full text...")
    candidates = []
    for e in all_entries:
        text = extract_text(e["url"])
        if text:
            e["text"] = text
            candidates.append(e)
            print(f"  [{len(candidates)}] {len(text)} chars — {e['title'][:60]}")
            if len(candidates) >= 20:
                break

    print(f"  {len(candidates)} articles extracted (>{MIN_TEXT_LENGTH} chars)")

    # ---- Step 3: Pick top 5 by length ----
    print("\n[Phase 3] Selecting top 5 by length...")
    candidates.sort(key=lambda a: len(a.get("text", "")), reverse=True)
    selected = candidates[:5]
    for i, a in enumerate(selected):
        print(f"  [{i}] {len(a['text'])} chars — {a['title'][:70]}")

    # ---- Step 4: LLM labels each article ----
    print("\n[Phase 4] Labeling articles...")
    labels = label_articles(client, selected)
    for i, (a, cat) in enumerate(zip(selected, labels)):
        print(f"  [{i}] → {cat}: {a['title'][:60]}")

    # ---- Step 5: Process each (translate + blanks + audio) ----
    print("\n[Phase 5] Processing (translate + blanks + audio)...")
    today = datetime.now(BEIJING_TZ).strftime("%Y-%m-%d")
    output_articles = []
    article_id = 1

    for a, cat in zip(selected, labels):
        print(f"\n  [{cat}] {a['title'][:70]} ({len(a['text'])} chars)")

        processed = process_article(client, a)
        if not processed:
            print(f"    [SKIP] LLM processing failed")
            continue

        audio_file = f"article-{article_id}.mp3"
        audio_path = output_dir / audio_file
        print(f"    Generating audio...")
        ok = await generate_audio(a["text"], audio_path)
        if not ok:
            audio_file = ""

        output_articles.append({
            "id": article_id,
            "category": cat,
            "source": a["source"],
            "sourceUrl": a["url"],
            "title": a["title"],
            "titleCn": processed["titleCn"],
            "summary": a.get("summary", "") or _first_sentence(a["text"]),
            "summaryCn": processed["summaryCn"],
            "wordCount": len(a["text"].split()),
            "audioFile": audio_file,
            "paragraphs": processed["paragraphs"],
            "blanks": processed["blanks"],
            "fullText": a["text"],
            "fullTextCn": processed["summaryCn"],
        })
        article_id += 1

    if not output_articles:
        print("\n[FAIL] No articles processed")
        sys.exit(1)

    # ---- Step 6: Write output ----
    data = {"date": today, "articles": output_articles}
    data_path = output_dir / "data.json"
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"DONE: {len(output_articles)} articles → {output_dir}")
    files = [f.name for f in sorted(output_dir.iterdir())]
    print(f"  Files: {files}")


def _clear_dir(path: Path) -> None:
    if path.exists():
        for f in path.iterdir():
            if f.is_file():
                f.unlink()
    path.mkdir(parents=True, exist_ok=True)


def _first_sentence(text: str) -> str:
    m = re.search(r"([^.!?]+[.!?])", text)
    return m.group(1).strip() if m else text[:200]


if __name__ == "__main__":
    asyncio.run(main())
