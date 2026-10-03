"""Fill `drive_file_id` on catalog revisions from a Drive folder listing (F-07).

Input: a JSON listing of one Drive module folder, as produced from the Drive API / connector:
  [{"id": "...", "title": "...", "fileSize": "12345", "mimeType": "application/pdf"}, ...]

A revision is matched only when exactly ONE Drive PDF has the same byte size AND the same name, compared
loosely (damaged ".pdf_" endings, hamza spelling variants and whitespace ignored).
Anything else is reported and left untouched. Existing drive_file_id values are never overwritten.

Usage:
  python scripts/match_drive_ids.py --module lean-startup --listing drive-lean.json          # report only
  python scripts/match_drive_ids.py --module lean-startup --listing drive-lean.json --write  # insert IDs
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
DRIVE_ID = re.compile(r"^[A-Za-z0-9_-]{20,}$")


def fix_extension(name: str) -> str:
    """'x.pdf _' / 'x.pdf_' -> 'x.pdf' (damaged endings seen in older uploads)."""
    return re.sub(r"\.pdf\s*_+$", ".pdf", name.strip(), flags=re.I)


def canonical(name: str) -> str:
    """Loose name key: fixed extension, NFKC, hamza-carrier letters folded, any whitespace -> one space.
    Exact byte size is matched separately, so this only has to tolerate spelling variants."""
    name = unicodedata.normalize("NFKC", fix_extension(name))
    name = re.sub("[\u0622\u0623\u0625]", "\u0627", name).replace("\u0626", "\u064A").replace("\u0624", "\u0648")
    return re.sub(r"\s+", " ", name).strip()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--module", required=True)
    ap.add_argument("--listing", required=True, type=Path)
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    listing = [f for f in json.loads(args.listing.read_text(encoding="utf-8")) if f.get("mimeType") == "application/pdf"]
    by_key: dict[tuple[str, int], list[dict]] = {}
    for f in listing:
        by_key.setdefault((canonical(f["title"]), int(f["fileSize"])), []).append(f)

    resources_file = REPO / "catalog" / "modules" / args.module / "resources.yaml"
    text = resources_file.read_text(encoding="utf-8")
    resources = yaml.safe_load(text) or []

    used: set[str] = set()
    inserts: dict[str, str] = {}
    damaged: list[str] = []
    for r in resources:
        for rev in r["revisions"]:
            label = f"{rev['id']:<24}"
            if rev.get("drive_file_id"):
                print(f"  kept       {label} {rev['drive_file_id']}")
                used.add(rev["drive_file_id"])
                continue
            matches = by_key.get((canonical(rev["source_filename"]), rev["bytes"]), [])
            if len(matches) != 1:
                print(f"  NO MATCH   {label} {rev['source_filename']} ({rev['bytes']} bytes) - {len(matches)} candidate(s)")
                continue
            f = matches[0]
            if not DRIVE_ID.match(f["id"]):
                print(f"  BAD ID     {label} {f['id']}")
                continue
            inserts[rev["id"]] = f["id"]
            used.add(f["id"])
            if fix_extension(f["title"]) != f["title"].strip():
                damaged.append(f"{rev['id']}: Drive name ends in \"{f['title'][-6:]}\" instead of \".pdf\"")
            print(f"  matched    {label} {f['id']}")

    for f in listing:
        if f["id"] not in used:
            print(f"  unused     {'':<24} {f['title']} ({f['fileSize']} bytes) - not in the catalog")
    if damaged:
        print("\nDrive files with damaged names (students would download them without a .pdf extension):")
        for d in damaged:
            print(f"  - {d}")

    if args.write and inserts:
        out = []
        for line in text.split("\n"):
            out.append(line)
            m = re.match(r"^(\s*)- id: (\S+)\s*$", line)
            if m and m.group(2) in inserts:
                out.append(f"{m.group(1)}  drive_file_id: {inserts[m.group(2)]}")
        resources_file.write_text("\n".join(out), encoding="utf-8")
        print(f"\nWrote {len(inserts)} drive_file_id value(s) to {resources_file.relative_to(REPO)}")
    elif inserts:
        print(f"\n{len(inserts)} match(es); re-run with --write to insert them.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
