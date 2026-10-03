# Phase 1 lightweight option — static catalog from a Git manifest

2026-09-29 · **Accepted on 2026-10-03 (option B).** Phase 1 follows this option. Where the [development plan](development-plan.md) and [architecture](architecture.md) describe a database and admin UI for Phase 1, read them as Phase 2 scope.

## Why consider it

Phase 1 is public, read-only browsing, maintained by one person a few times per week. The current plan builds a database, an admin web interface, administrator sign-in, publication snapshots, and database backups before any student needs an account. This option postpones all of that to Phase 2, when personal records first require it.

Nothing confirmed changes: GitHub source hosting, GitHub → Coolify CI/CD, the university Proxmox/Coolify server, Drive for PDFs, Moodle as the authority, incremental NotebookLM, local-first preparation, and Arabic/French/English support.

## How it works

1. The catalog is a set of YAML files in the repository: one per module, listing its resources, revisions, learning aids, and update notices, all with stable IDs.
2. Local Python scripts (extending those already in `D:\My UFCs\tmp`) compute checksums, validate the manifest, and draft entries from the library folders. You review the diff before committing.
3. **Publishing is a commit.** Pushing to `main` runs CI checks: the schema is valid, IDs are unique, every published item has a rights status, no local paths or secrets are present, and Drive links match the allowed pattern. CI then builds the static Astro site and deploys it through the confirmed GitHub → Coolify path.
4. The Git history serves as the publication log and rollback mechanism. Withdrawing an item means a commit that sets it to `withdrawn`, plus revoking the Drive share where needed.
5. Search uses a small index generated at build time. It holds original and normalized Arabic/Latin titles, tags, and summaries, and is searched in the browser. With about 74 resources, it stays well under the 500 KB page budget.

```yaml
# catalog/modules/lean-startup.yaml (illustrative)
id: lean-startup
moodle_course_id: 22
title: { ar: "المؤسسات الناشئة المرنة", en: "Lean Startup" }
resources:
  - id: ls-unit-02
    origin: official
    type: lecture
    order: 2
    title: "Unit 02 - الوحدة 02 - الجامعة الريادية في عصر الذكاء الاصطناعي والاقتصاد المعرفي"
    rights: approved_public
    status: published
    revisions:
      - id: ls-unit-02-r1
        sha256: "…"
        drive_file_id: "…"
        discovered: 2026-09-25
```

## What it changes in the feature specifications

| Area | Current plan | This option |
| --- | --- | --- |
| F-06/F-07 intake and publishing | Admin web UI, database states, outbox | Local scripts plus a reviewed Git commit; states stored as YAML fields |
| F-08 generation queue | Database table and admin screen | `queue.yaml` in the repository, or a local spreadsheet |
| F-10 admin access | Better Auth administrator sign-in from Phase 1 | GitHub account access; there is no admin surface on the public server |
| Publish latency | Under 5 minutes via snapshot | CI build plus deploy time; measure it in M0 |
| Phase 1 backups | Nightly PostgreSQL dump, three layers | Git repository, Drive, and local library; no database yet |
| Attack surface | Public app with login and admin endpoints | Static files only |

Additional limitation: publishing requires a PC with Git and the scripts. It cannot be done from a phone browser.

## Effort (planning judgment, same basis as the development plan)

| Stage | Current plan | This option |
| --- | ---: | ---: |
| M0 pilot | 16–24 h | 12–18 h (no OAuth or database feasibility needed yet) |
| M1 public experience | 20–30 h | 20–30 h |
| M2 content administration | 32–48 h | 10–16 h (manifest schema, validation, CI, deploy) |
| M3 complete Phase 1 | 24–36 h | 20–30 h |
| M4 pilot corrections | 8–14 h | 8–14 h |
| **Phase 1 total** | **100–152 h** | **70–108 h** |

The saving is partly deferred, not eliminated. Phase 2 must then add PostgreSQL, Better Auth, and database backups, estimated at +12–20 h over the current Phase 2 figure. In Phase 2 the Git manifest remains the catalog source of truth; the database holds only accounts, bookmarks, progress, and attempts, keyed by the stable manifest IDs.

## Decision needed

Choose one:

- **A.** Keep the current plan: database and admin UI from Phase 1.
- **B.** Adopt this option for Phase 1 and add the database in Phase 2.
