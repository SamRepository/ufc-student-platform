# UFC Master 1 S1 student platform

A student-initiative course portal for UFC Master 1, Semester 1 accounting students. It organizes the eight modules' course PDFs, Moodle links, updates and reviewed study aids into one phone-friendly site in Arabic (default, RTL), French and English.

**Status (2026-10-03):** M0 pilot. Phase 1 follows [Option B](docs/phase1-lightweight-option.md): a static Astro site built from a reviewed YAML manifest in Git. There is no database, login or admin server until Phase 2. Planning documents live in [docs/](docs/README.md).

Moodle remains the official source. Course files are never committed here: PDFs live in Google Drive, and the manifest stores only metadata, checksums and Drive file IDs.

## Requirements

- Node 22.12 or later (Astro 7)
- Python 3.12 with PyMuPDF and PyYAML, for `scripts/draft_manifest.py` only

## Commands

| Command | Does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server with only **published** content |
| `npm run dev:drafts` | Dev server that also shows drafts, marked "Draft — not public" |
| `npm run validate` | Check the catalog schema and publication rules |
| `npm test` | Unit tests (normalization, rules, projection, search) |
| `npm run build` | Validate, then build the static site into `dist/` |
| `npm run build:drafts` | Build a local preview including drafts. Never deploy this. |
| `npm run check` | Type-check Astro and TypeScript files |

## Catalog layout

```
catalog/
  semester.yaml                  semester title, Moodle portal, module display order
  updates.yaml                   reviewed change feed (F-05)
  covers/<module-id>.<ext>       course covers (optimized at build time)
  modules/<module-id>/
    module.yaml                  titles, Moodle course, verified facts, overview, study aids
    resources.yaml               resources and their immutable revisions
```

The schema lives in [src/lib/schema.ts](src/lib/schema.ts) and the cross-file rules in [src/lib/rules.ts](src/lib/rules.ts). A resource is public only when all three hold:

- `status: published`
- `rights: approved_public`
- its current revision has a `drive_file_id`

## Publishing workflow (publishing is a commit)

1. Prepare the file locally as before: download it, convert DOC/DOCX to PDF, and check it.
2. Draft the catalog entries. The script is read-only on the library:

   ```sh
   python scripts/draft_manifest.py --module lean-startup --source "D:/My UFCs/Master/2027-2026 Master S1/<module folder>"
   ```

   It reports `unchanged`, `CHANGED`, `new` and `missing` files. Add `--write` to append the proposed `new` entries as `status: draft`.
3. Review each entry: title, type, order, language and rights.
4. Upload the PDF to the module's Drive folder, then fill in `drive_file_id`:
   - by hand, or
   - with `python scripts/match_drive_ids.py --module <id> --listing <drive-folder.json> [--write]`. It matches on exact byte size plus a spelling-tolerant name, writes only one-to-one matches, and flags damaged `.pdf_` names.
5. Set `status: published` and `reviewed: <date>`, and add an `updates.yaml` entry if students should be told.
6. Run `npm run validate` and `npm run dev`, check the page, then commit. CI and deployment to Coolify come later in M0/M2.

Changed file → add a new revision (new `id`, `sha256`, …) and point `current_revision` at it. Never edit an existing revision.

Withdrawal → set `status: withdrawn` with a `withdrawal_reason`, and revoke the Drive share if needed.

## Never commit

Course files (`*.pdf`, `*.docx`, …), local paths, `Master\Links`, enrollment documents, credentials or tokens. `.gitignore` blocks the common file types, and the validator rejects local paths and non-allowlisted URLs.
