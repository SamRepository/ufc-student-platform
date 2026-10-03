"""Draft catalog entries from a local library module folder (content-workflow, F-06).

Read-only on the library: it hashes and inspects PDFs, compares them with the module's
catalog/modules/<module>/resources.yaml and reports:

  unchanged  - a revision with the same SHA-256 is already recorded
  changed    - a recorded source_filename now has different bytes (needs a NEW revision; reviewed by hand)
  new        - not in the manifest; a draft entry is proposed
  missing    - recorded in the manifest but no longer in the folder

Usage:
  python scripts/draft_manifest.py --module lean-startup --source "D:/My UFCs/Master/2027-2026 Master S1/<folder>"
  python scripts/draft_manifest.py ... --write     # append proposed NEW entries to resources.yaml

Entries are always drafted as `status: draft`. Review titles, types, order and rights, add the
Drive file ID, then set `status: published` and `reviewed:` in a commit. Local paths are never written.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF
import yaml

REPO = Path(__file__).resolve().parent.parent
ARABIC = re.compile(r"[\u0600-\u06FF]")
LATIN = re.compile(r"[A-Za-z]{3,}")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def page_count(path: Path) -> int | None:
    try:
        with fitz.open(path) as pdf:
            return len(pdf)
    except Exception as exc:  # damaged file: still report it, but flag for review
        print(f"  ! could not open {path.name}: {exc}", file=sys.stderr)
        return None


def guess(prefix: str, filename: str, used: set[str]) -> dict:
    """Heuristic first draft — every field is expected to be reviewed by hand."""
    stem = Path(filename).stem
    entry: dict = {"type": "lecture", "origin": "official", "featured": False}

    if "Moodle Notes" in stem:
        entry.update(type="notes", origin="student_note", featured=True, order=0, base=f"{prefix}-notes")
        title = "Moodle Notes"
    else:
        m = re.match(r"^\s*(?:Unit\s*)?(\d{1,2})\s*[-–]\s*(.*)$", stem, re.I)
        title = m.group(2).strip() if m and m.group(2).strip() else stem.strip()
        if re.match(r"^\s*Unit\s*\d", stem, re.I):
            title = stem.strip()  # keep "Unit NN - ..." verbatim: the unit number is part of the Moodle title
        number = None
        if m:
            number = int(m.group(1))
        else:
            n = re.search(r"(\d{1,2})(?!\d)", stem)
            number = int(n.group(1)) if n else None
        if re.search(r"البرنامج التفصيلي|syllabus|programme", stem, re.I):
            entry.update(type="syllabus")
        elif re.search(r"قائمة|مراجع|references|bibliograph", stem, re.I):
            entry.update(type="reference")
        entry["order"] = number if number is not None else 90
        kind = "unit" if re.match(r"^\s*Unit", stem, re.I) else "res"
        entry["base"] = f"{prefix}-{kind}-{number:02d}" if number is not None else f"{prefix}-{entry['type']}"

    base, i = entry.pop("base"), 2
    rid = base
    while rid in used:
        rid, i = f"{base}-{i}", i + 1
    used.add(rid)
    entry["id"] = rid

    if ARABIC.search(title):
        entry["language"] = "mixed" if LATIN.search(title) and not title.startswith("Unit") else "ar"
    else:
        entry["language"] = "en"
    year = re.search(r"(20\d\d\s*-\s*20\d\d)", stem)
    entry["title"] = {"original": title}
    entry["_year"] = year.group(1).replace(" ", "") if year else None
    return entry


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--module", required=True, help="catalog module id, e.g. lean-startup")
    ap.add_argument("--source", required=True, type=Path, help="local library folder for the module")
    ap.add_argument("--write", action="store_true", help="append proposed new entries to resources.yaml")
    ap.add_argument("--rights", default="approved_public", choices=["unknown", "link_only", "approved_public", "restricted"])
    ap.add_argument("--rights-basis", default="owner-confirmation-2026-09-26")
    args = ap.parse_args()

    module_dir = REPO / "catalog" / "modules" / args.module
    module = yaml.safe_load((module_dir / "module.yaml").read_text(encoding="utf-8"))
    resources_file = module_dir / "resources.yaml"
    resources = yaml.safe_load(resources_file.read_text(encoding="utf-8")) or []
    if not args.source.is_dir():
        print(f"source folder not found: {args.source}", file=sys.stderr)
        return 2

    by_sha: dict[str, str] = {}
    by_name: dict[str, tuple[str, str]] = {}
    used: set[str] = set()
    for r in resources:
        used.add(r["id"])
        for rev in r["revisions"]:
            used.add(rev["id"])
            by_sha[rev["sha256"]] = r["id"]
            by_name[rev["source_filename"]] = (r["id"], rev["sha256"])

    pdfs = sorted(p for p in args.source.iterdir() if p.is_file() and p.suffix.lower() == ".pdf")
    seen_names: set[str] = set()
    new_entries: list[dict] = []
    print(f"{args.module}: {len(pdfs)} PDF(s) in source, {len(resources)} resource(s) in manifest\n")

    for pdf in pdfs:
        seen_names.add(pdf.name)
        digest = sha256(pdf)
        if digest in by_sha:
            print(f"  unchanged  {by_sha[digest]:<22} {pdf.name}")
            continue
        if pdf.name in by_name:
            print(f"  CHANGED    {by_name[pdf.name][0]:<22} {pdf.name}  (add a new revision by hand after review)")
            continue
        if digest in {e['revisions'][0]['sha256'] for e in new_entries}:
            print(f"  duplicate  {'':<22} {pdf.name}  (same bytes as another new file — skipped)")
            continue
        g = guess(module["id_prefix"], pdf.name, used)
        acquired = dt.date.fromtimestamp(pdf.stat().st_mtime).isoformat()
        revision = {
            "id": f"{g['id']}-r1",
            "sha256": digest,
            "bytes": pdf.stat().st_size,
            "pages": page_count(pdf),
            "source_filename": pdf.name,
            "acquired": acquired,
        }
        if g.pop("_year"):
            revision["academic_year_label"] = re.search(r"20\d\d\s*-\s*20\d\d", pdf.stem).group(0).replace(" ", "")
        if revision["pages"] is None:
            del revision["pages"]
        entry = {
            "id": g["id"],
            "type": g["type"],
            "order": g["order"],
            "origin": g["origin"],
            "language": g["language"],
            "featured": g["featured"],
            "title": g["title"],
            "rights": args.rights,
            "rights_basis": args.rights_basis,
            "status": "draft",
            # Student notes are not official material, so they get no "Official source" link.
            **({"official_url": module["moodle"]["url"]} if g["origin"] == "official" else {}),
            "current_revision": revision["id"],
            "revisions": [revision],
        }
        new_entries.append(entry)
        print(f"  new        {g['id']:<22} {pdf.name}")

    for name, (rid, _) in by_name.items():
        if name not in seen_names:
            print(f"  missing    {rid:<22} {name}  (withdraw or keep? decide by hand)")

    if not new_entries:
        print("\nNo new entries to propose.")
        return 0

    block = yaml.safe_dump(new_entries, allow_unicode=True, sort_keys=False, width=1000)
    if args.write:
        text = resources_file.read_text(encoding="utf-8")
        text = re.sub(r"^\[\]\s*$", "", text, flags=re.M).rstrip() + "\n"
        resources_file.write_text(text + block, encoding="utf-8")
        print(f"\nAppended {len(new_entries)} draft entr{'y' if len(new_entries) == 1 else 'ies'} to {resources_file.relative_to(REPO)}")
    else:
        print("\nProposed entries (re-run with --write to append):\n")
        print(block)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
