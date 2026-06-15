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

from cfg import (
    RSS_FEEDS, CATEGORIES,
    MAX_PER_FEED,
    OUTPUT_DIR, MIN_TEXT_LENGTH,
    BLANKS_MIN, BLANKS_MAX,
    DEEPSEEK_BASE_URL, DEEPSEEK_MODEL,
    WORD_LEVEL, WORD_LEVEL_GUIDE,
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


def _clean_text(text: str) -> str:
    """Remove photo credits, navigation chrome, footer, and other artifacts."""
    lines = text.split('\n')
    cleaned = []
    skip_patterns = [
        r'^\s*\|?\s*(?:中文|English)\s*[☰☱☲☳☴☵☶☷]*\s*$',  # language switcher
        r'^\s*Home\s*/\s*CNS',                               # breadcrumb
        r'^\s*Home\s*(?:/.*)?$',                              # breadcrumb fragments
        r'^\s*ECNS\s+App\s+Download',                         # app banner
        r'^\s*Back\s+to\s+top\s*$',                           # back to top
        r'^\s*About\s+Us\s*\|',                               # footer nav
        r'^\s*Copyright\s*©',                                 # copyright
        r'^\s*\[?\s*[京津沪渝苏浙皖闽赣鲁豫鄂湘粤琼川贵云陕甘青辽吉黑晋冀蒙宁新藏桂]\s*',  # Chinese license numbers
        r'^\s*[0-9]+-[0-9]+-[0-9]+\s*$',                     # date-only line (2026-06-15)
        r'^\s*A{2,}\s*$',                                     # "A A A" font controls
        r'^\s*:\s*$',                                         # standalone colon
        r'^\s*\|\s*$',                                        # standalone pipe
        r'^\s*Reproduction\s+in\s+whole',                     # copyright text
        r'^\s*MORE\s*>\s*$',                                  # "MORE >" links
        r'^\s*Most\s+Popular\s*$',                            # sidebar header
        r'^\s*[☰☱☲☳☴☵☶☷]\s*$',                             # hamburger/icon lines
        r'^\s*:\s+A\s+A\s+A\s*$',                            # font size controls
        r'^\s*(?:Editor|Reporter)\s*:.*$',                    # editor credit
        r'(?:许可证|ICP证|公网安备|视听节目许可证|ICP备)\s*[\(（]?\d+[\)）]?',  # Chinese license numbers
        r'^\s*(?:微信|微博|QQ|WeChat|Weibo)\s*$',             # social media
        r'^\s*More\s+World.*$',                               # related articles sidebar
        r'^\s*Chinanews\.com\s*$',                            # site name standalone
        r'^\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s*\d{4}\s*\|?\s*$',  # date header
        r'^\s*Text\s*:\s*$',                                  # "Text:" label
        r'^\s*A+\s*$',                                        # font size "A", "A A A"
        r'^\s*Print\s*$',                                     # print button
        r'^\s*CNS\s*$',                                       # breadcrumb fragment
        r'^\s*\d{4}-\d{2}-\d{2}\s+[\d:]{5,}\s*$',            # timestamp "2026-06-15 14:22:22"
        r'^\s*\d{4}-\d{2}-\d{2}T\d{6}Z[_\d].*$',             # image ID
        r'^\s*People\'?s?\s+Daily\s*$',                       # footer link
        r'^\s*Xinhua\s*$',                                    # footer link
        r'^\s*CGTN\s*$',                                      # footer link
        r'^\s*China\s+Daily\s*$',                             # footer link
        r'^\s*\[\s*\]\s*\[\s*\]\s*\[\s*\]\s*\[\s*\]\s*$',   # empty bracket placeholders
        r'^\s*More\s*$',                                      # "More" section header
        r'^\s*(?:Home|News|Ecns Wire|Opinion)(?:\s*\|\s*(?:Home|News|Ecns Wire|Opinion))*\s*$',  # nav bar
        r'^\s*☰\s*(?:Menu)?\s*$',                             # hamburger menu
        r'^\s*through\s+your\s+browser\.?\s*$',               # cookie banner fragment
        r'^\s*(?:cookie\s+)?(?:settings?|preferences?|policy)\.?\s*$',  # cookie text
        r'^\s*(?:accept|decline|manage)\s+(?:all\s+)?cookies?\.?\s*$',  # cookie buttons
    ]
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append(line)
            continue
        skip = False
        for pat in skip_patterns:
            if re.search(pat, stripped, re.IGNORECASE):
                skip = True
                break
        if not skip:
            cleaned.append(line)
    text = '\n'.join(cleaned)
    # Cookie / privacy banners (DOTALL to match across lines)
    text = re.sub(r'(?is)by\s+continuing\s+to\s+(browse|use).*?cookie\s+settings?\.?', '', text)
    text = re.sub(r'(?is)we\s+use\s+cookies.*?privacy\s+policy\.?', '', text)
    text = re.sub(r'(?is)you\s+can\s+(manage|change)\s+(your\s+)?(preferences|settings).*?through\s+your\s+browser\.?', '', text)
    # Cookie banner fragments (standalone or at start of paragraph)
    text = re.sub(r'(?:^|\n)\s*through\s+your\s+browser\.?\s*', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:^|\n)\s*cookie\s+(settings?|preferences?|policy)\.?\s*', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:^|\n)\s*(?:accept|decline)\s+(?:all\s+)?cookies?\.?\s*', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:^|\n)\s*manage\s+(?:your\s+)?(?:cookie\s+)?(?:preferences|settings)\.?\s*', '\n', text, flags=re.IGNORECASE)
    # Photo credit markers
    text = re.sub(r'\n?/VCG\n?', '\n', text)
    text = re.sub(r'\n?\(VCG\)\n?', '\n', text)
    text = re.sub(r'\n?/CGTN\n?', '\n', text)
    text = re.sub(r'\n?Photo:?\s*.*?(?:\n|$)', '\n', text)
    # Remove subheadings: standalone lines + inline (merged with paragraph)
    text = _strip_subheadings(text)
    text = _strip_inline_subheadings(text)
    # Extract the main article body (longest continuous text block)
    text = _extract_main_body(text)
    # Remove more than 2 consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _extract_main_body(text: str) -> str:
    """Extract the actual article body from page text that includes nav, related
    articles, and footer mixed in without blank-line separation.

    Strategy: find the first and last "content" line (long, multi-sentence) and
    keep everything between them.
    """
    lines = text.split('\n')
    if len(lines) < 5:
        return text

    # Find start: first line that looks like article content (long, starts a sentence)
    start = 0
    for i, line in enumerate(lines):
        s = line.strip()
        if not s:
            continue
        # Long line with sentence structure → article body
        if len(s) > 120:
            start = i
            break
        # Article source marker
        if re.match(r'\([A-Z]+\)\s*--', s):
            start = i
            break

    # Find end: last line that is long article content (not a short link/title)
    end = len(lines) - 1
    for i in range(len(lines) - 1, start, -1):
        s = lines[i].strip()
        if not s:
            continue
        if len(s) > 120:
            end = i
            break

    # Trim lines before start and after end
    result = lines[start:end + 1]
    # Remove leading/trailing blank lines
    while result and not result[0].strip():
        result.pop(0)
    while result and not result[-1].strip():
        result.pop()

    return '\n'.join(result)


def _strip_subheadings(text: str) -> str:
    """Remove standalone subheading lines from news articles.

    Heuristic: a line that is short (under 120 chars), in Title Case
    (>=80% of words start with uppercase), ends without sentence-ending
    punctuation, and is followed by a substantially longer paragraph line.
    """
    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        # Skip blank lines
        if not stripped:
            result.append(line)
            i += 1
            continue
        # Skip lines with blank markers
        if re.search(r'\{\{\d+\}\}', stripped):
            result.append(line)
            i += 1
            continue
        # Check if this looks like a subheading
        if _is_subheading(stripped) and i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            # Subheading is followed by a longer paragraph
            if len(next_line) > len(stripped) * 1.5 and len(next_line) > 100:
                i += 1  # skip this line
                continue
        result.append(line)
        i += 1
    return '\n'.join(result)


def _is_subheading(line: str) -> bool:
    """Check if a line looks like a news subheading."""
    line = line.strip()
    if len(line) > 120 or len(line) < 15:
        return False
    if line.endswith(('.', '!', '?', ',', ';', ':')):
        return False
    words = line.split()
    if len(words) < 3:
        return False
    upper_words = sum(1 for w in words if w[0].isupper())
    if upper_words / len(words) >= 0.5:
        return True
    return False


def _strip_inline_subheadings(text: str) -> str:
    """Remove subheadings that are merged inline with paragraph text on the same line.

    Pattern: 'A Fierce Battle at Langwogou The Langwogou valley was a vital...'
    The subheading (title case, 3-8 words) is immediately followed by a normal sentence.
    """
    # Match: at least 3 title-case words, followed by a word starting lowercase or 'The'/'A'/'An'
    # which signals the start of the actual paragraph
    pattern = re.compile(
        r'(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,7})'  # 3-8 title-case words
        r'\s+'                                               # separator
        r'(?=(?:[A-Z][a-z]+\s+){0,3}'                        # 0-3 more capitalized words (proper nouns)
        r'(?:[a-z]|was|were|has|had|will|would|is|are|the|a|an)\b)'  # then a sentence-start word
    )
    def _replace(m):
        heading = m.group(1)
        # Verify it looks like a heading (no function words as first words)
        first_words = heading.split()[:2]
        func_words = {'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
                      'and', 'or', 'but', 'is', 'are', 'was', 'were', 'has', 'had',
                      'this', 'that', 'these', 'those', 'it', 'they', 'not', 'no'}
        if first_words[0].lower() in func_words:
            return m.group(0)  # keep intact
        return m.group(0)[len(heading):]  # remove heading, keep rest
    text = pattern.sub(_replace, text)
    return text


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
    text = _clean_text(text)
    if len(text) < MIN_TEXT_LENGTH:
        return None
    # Quality check: reject text that's mostly short lines (sidebar/related articles spam)
    if _is_low_quality(text):
        print(f"    [WARN] Low quality text (mostly short lines), skipping")
        return None
    return text


def _is_low_quality(text: str) -> bool:
    """Check if extracted text is mostly sidebar junk rather than article body."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if len(lines) < 5:
        return True
    short = sum(1 for l in lines if len(l) < 100)
    return short / len(lines) > 0.7


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

TRANSLATE_PROMPT = """You are a listening exercise designer and Chinese translator.

Given an English news article split into paragraphs:
1. Translate the title to Chinese.
2. Translate EACH paragraph to Chinese (complete translation).
3. Write a one-sentence Chinese summary.
4. Select {blank_count} words to blank out for a listening cloze exercise.

Word selection — {word_level} LEVEL:
- Target difficulty: {word_guide}
- Each selected word MUST appear exactly as-is in the original text
- Provide a short Chinese hint (e.g., "v. 包含", "n. 影响", "adj. 显著的")
- Assign difficulty: "easy", "medium", or "hard" (relative to {word_level} level)
- Skip: basic function words, proper nouns, numbers, dates, article titles

Return ONLY valid JSON:
{{
  "titleCn": "中文标题",
  "summaryCn": "一句中文摘要",
  "paragraphsCn": ["段落1中文翻译", "段落2中文翻译"],
  "blanks": [
    {{"word": "exactWordFromText", "hint": "v. 中文提示", "difficulty": "medium"}}
  ]
}}"""


def process_article(client: OpenAI, article: dict) -> dict | None:
    """Translate article + generate blanks. Returns processed article dict or None."""
    text = article["text"]
    title = article["title"]
    blank_count = random.randint(BLANKS_MIN, BLANKS_MAX)

    # Pre-split into paragraphs so LLM can translate each one
    sentences = _split_sentences(text)
    chunk_size = max(3, len(sentences) // max(1, len(sentences) // 5))
    raw_paragraphs = []
    for i in range(0, len(sentences), chunk_size):
        chunk = ' '.join(sentences[i:i + chunk_size]).strip()
        if chunk:
            raw_paragraphs.append(chunk)

    # Build user message with numbered paragraphs
    para_text = '\n\n'.join(f'[P{i}] {p}' for i, p in enumerate(raw_paragraphs))
    user_msg = f"Title: {title}\n\nArticle paragraphs:\n{para_text}"

    prompt = TRANSLATE_PROMPT.format(
        blank_count=blank_count,
        word_level=WORD_LEVEL,
        word_guide=WORD_LEVEL_GUIDE.get(WORD_LEVEL, WORD_LEVEL_GUIDE['IELTS']),
    )
    content = call_llm(client, prompt, user_msg, max_tokens=8192)
    if not content:
        return None

    result = parse_json_response(content)
    if not result or "blanks" not in result or not result["blanks"]:
        print(f"    [ERROR] LLM returned no blanks")
        return None

    # Insert blanks into the raw paragraphs
    para_cn_list = result.get("paragraphsCn", [])
    paragraphs_with_blanks, used_blanks = _insert_blanks(raw_paragraphs, result["blanks"])

    # Build final paragraphs with per-paragraph translations
    final_paragraphs = []
    for i, en_text in enumerate(paragraphs_with_blanks):
        cn = para_cn_list[i] if i < len(para_cn_list) else ""
        final_paragraphs.append({"en": en_text, "cn": cn})

    return {
        "titleCn": result.get("titleCn", ""),
        "fullTextCn": '\n\n'.join(para_cn_list) if para_cn_list else "",
        "summaryCn": result.get("summaryCn", ""),
        "paragraphs": final_paragraphs,
        "blanks": used_blanks,
    }


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]


def _insert_blanks(paragraphs: list[str], raw_blanks: list[dict]) -> tuple[list[str], list[dict]]:
    """Insert {{id}} markers into paragraphs. Returns (modified_paragraphs, used_blanks)."""
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

    used = []
    consumed: set[str] = set()
    for b in blanks:
        word = b["answer"]
        if word.lower() in consumed:
            continue
        pattern = re.compile(r"\b" + re.escape(word) + r"\b")
        placed = False
        for pi in range(len(paragraphs)):
            if pattern.search(paragraphs[pi]):
                paragraphs[pi] = pattern.sub(f"{{{{{b['id']}}}}}", paragraphs[pi], count=1)
                used.append(b)
                consumed.add(word.lower())
                placed = True
                break
        if not placed:
            print(f"    [WARN] Could not place '{word}' in text, skipping")

    for i, b in enumerate(used):
        b["id"] = i

    return paragraphs, used


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
            "paragraphs": processed["paragraphs"],
            "blanks": processed["blanks"],
            "fullText": a["text"],
            "fullTextCn": processed.get("fullTextCn", ""),
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
