#!/usr/bin/env python3
"""One-off: rebuild the per-day archive from git history.

Before 2026-09-21 every run overwrote a single public/data/daily-practice/
data.json, so only the latest day survived on disk. Each daily commit still
holds that day's file, so we can walk the history and recover all of them.

Safe to re-run: existing day files are left alone unless --force is given.

  python scripts/daily-crawl/backfill_archive.py [--force]
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = REPO_ROOT / "public" / "data" / "daily-practice"
TRACKED_PATH = "public/data/daily-practice/data.json"


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=REPO_ROOT, capture_output=True, text=True, encoding="utf-8"
    )
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def commits_touching_data_file() -> list[str]:
    out = git("log", "--format=%H", "--", TRACKED_PATH)
    return [line.strip() for line in out.splitlines() if line.strip()]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="rewrite existing day files")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    shas = commits_touching_data_file()
    print(f"Found {len(shas)} commits touching {TRACKED_PATH}")

    recovered: dict[str, str] = {}
    skipped: list[str] = []
    failed: list[str] = []

    # Oldest first so a later commit wins if two commits share a date.
    for sha in reversed(shas):
        try:
            raw = git("show", f"{sha}:{TRACKED_PATH}")
            data = json.loads(raw)
        except Exception as exc:
            failed.append(f"{sha[:8]} ({exc})")
            continue

        date = data.get("date")
        articles = data.get("articles") or []
        if not date or not articles:
            failed.append(f"{sha[:8]} (no date or no articles)")
            continue

        path = OUTPUT_DIR / f"{date}.json"
        if path.exists() and not args.force:
            skipped.append(date)
            recovered[date] = "on disk"
            continue

        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        recovered[date] = f"from {sha[:8]}"

    dates = sorted(recovered)
    (OUTPUT_DIR / "index.json").write_text(
        json.dumps({"dates": dates}, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\nRecovered {len(dates)} days ({dates[0] if dates else '-'} → {dates[-1] if dates else '-'})")
    print(f"  {len(skipped)} already on disk (use --force to rewrite)")
    if failed:
        print(f"  {len(failed)} unusable: {', '.join(failed[:5])}")
    print(f"\nWrote {len(dates)} day files + index.json into {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
