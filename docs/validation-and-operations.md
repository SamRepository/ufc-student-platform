# Validation, launch readiness, and operations

Version 1.0 · 2026-09-26 · Proposed acceptance and operating procedures.

## 1. Test strategy

Test meaningful behavior rather than mirroring implementation. Use fixtures with Arabic/French/English metadata, an Arabic Word-to-PDF conversion, a duplicate with a renamed file, a replaced source, a restricted link, an outdated aid, an unknown deadline, and two unrelated student accounts. Do not use private student records in tests.

| Area | Required evidence |
| --- | --- |
| Public browsing | Signed-out user reaches all eight modules; only published fields are returned; course notes are first within each resource list |
| Search | Exact and partial titles, mixed scripts, approved Arabic normalization, filters, no-results state, and absence of drafts |
| Mobile/RTL | 320px-wide viewport (the F-14 minimum) and a typical 360px phone, both without page overflow; readable tables, mixed-direction filenames, keyboard navigation, visible focus, sensible heading order |
| Resource access | Intended audience can open approved links; unrelated/signed-out user sees expected access behavior; revoked link has useful guidance |
| Conversion | Arabic shaping, page order, tables, symbols, images, and links reviewed in rendered PDF; original and output checksums retained |
| Repeated import | Same source/version submitted twice produces one candidate and one publication event; rename alone does not duplicate a lesson |
| Changed/removed source | Changed content requires review; original revision remains traceable; disappearance during a failed check does not delete it |
| Publication | Two reviewers acting on an old revision get a conflict; failed upload never publishes a broken current version; rollback restores the previous catalog |
| GitHub → Coolify CI/CD | A failed required check prevents deployment; one successful release deploys its exact tested commit/image; competing commit hooks cannot bypass CI; overlapping releases are serialized; webhook acceptance is followed by actual health/smoke verification; PR checks receive no production secrets |
| Degraded database mode | Stop PostgreSQL in staging: valid public snapshot remains browsable, private writes fail clearly, readiness retains public traffic, and admin monitoring reports degradation; incompatible new migrations still fail the deployment gate |
| AI aid lifecycle | Official and AI labels are clear; source revisions and review recorded; source replacement flags affected aids; blocked generation does not consume infinite retries |
| Assessment dates | UTC/timezone conversion tested; date-only and unknown-time values are not displayed with invented times; corrected deadlines appear in update history |
| Authorization | Visitor cannot mutate; student cannot publish; editor cannot grant owner; ingestion token cannot read student data |
| Personal records, Phase 2 | Student A cannot read/write/export student B's bookmarks, attempts or progress through UI or direct API; no database endpoint/credential is exposed to students |
| Native practice, Phase 2 | Server recomputes score; altered question IDs/options rejected; attempt ties to immutable question version; external quizzes never create fake scores |
| Recovery | Restore metadata backup into staging, reconcile Drive IDs, rebuild public projection, and prove emergency withdrawal works |

Automate pure normalization, fingerprint/state-transition logic, publication transactions, role/ownership checks, and core browser journeys. Perform manual review for real PDF rendering, actual provider sharing behavior, Arabic readability, and representative AI content accuracy. Re-run affected checks when a relevant feature or integration changes.

## 2. Proposed quality targets

- Main content available within 3 seconds on a representative mid-range phone under a defined throttled connection; record the test device/network rather than claiming universal speed.
- Initial public page transfer target below 500 KB excluding intentionally opened PDFs/media; lazy-load covers and never auto-download video/audio.
- Search over the initial catalog responds within 300 ms after index load on the pilot device.
- Keyboard access, text alternatives, sufficient contrast, labels, reduced motion support, and no essential information conveyed by color alone.
- Published public projection updated within five minutes of a successful publish under normal operation; failure keeps the old snapshot with an admin warning.
- No claim of high availability on one university VM. Track successful checks and publication failures rather than presenting a misleading “live sync” badge.

These are proposed project targets, not benchmark results or certification claims.

## 3. Phase 1 release gate

Release only after the owner reviews:

1. Eight module pages, reviewed import manifest, and permitted metadata/file publication.
2. Signed-out navigation and actual external access behavior on desktop and iPhone Safari or an equivalent real-device check.
3. Administrator authentication and unauthorized-access tests.
4. A complete update cycle, including duplicate detection, replacement, failed upload, withdrawal, and recovery.
5. At least one approved learning-aid publication using a supported mechanism. Do not block all modules on generation of every format.
6. No critical defects; unresolved minor issues listed with a workaround and owner.
7. Confirmed content permission/cadence recorded; residual service budget, privacy notice, default language, host operations owner, and backup location agreed.
8. A restore exercise and documented operator instructions.

A pilot of 5–10 willing students is suggested. Ask them to find a specified lecture, distinguish an official PDF from an AI aid, locate a recent update, and explain whether a Moodle login is needed. Collect navigation feedback without collecting unnecessary personal details.

## 4. Routine operation

**A few times per week, maintained by the user:** inspect or run the authorized Moodle discovery; review new candidates; resolve failed downloads; verify conversion and permissions; publish approved changes; triage dependent aids. This cadence is confirmed; exact days/times are configurable. Supported remote discovery can run on the university VM, but local preparation pauses if the PC is offline. Record missed work and resume; do not report it as completed.

**Weekly:** review broken/access-limited links, outdated aids, repeated job failures, conversion backlog, generation capacity, and actual administrator effort. Recheck a sample of published artifacts from an unrelated account. Confirm the most recent backup completed.

**Monthly:** review bills, provider limits/sharing changes, role assignments, dependency updates, privacy requests, and restoration readiness. Revise estimates based on observed use. Do not collect detailed reading histories just to measure adoption; use voluntary feedback or aggregate minimal metrics where enabled.

Job health should show last attempt and last success separately, pending/review/failed counts, retries, and human-readable blockers. Proposed retry policy: bounded exponential backoff for transient errors, maximum three attempts per run, then an operator task. Authentication failure, permission denial, and generation-capacity exhaustion require different handling; avoid repeatedly retrying them as network errors.

## 5. Backup, restore, and incident response

Proposed target: daily encrypted catalog/private-data backup, private retention of 30 days, and a monthly restore exercise. Preserve immutable approved local files plus an independent backup destination; a synced folder alone can propagate accidental deletion. Keep backup credentials separate from application credentials.

Coolify documents scheduled database backups. An application database backup, a Coolify control-plane backup, and a Proxmox VM backup cover different recovery needs; maintain and test each applicable layer. [Coolify database backups](https://coolify.io/docs/databases/backups), [Coolify instance backups](https://coolify.io/docs/core/backup-and-recovery/instance-backup). Drive files, exported learning aids, covers, and local Word originals need their own inventory and recovery path. See the [deployment specification](deployment-specification.md) for the proposed host design.

Suggested recovery objectives: restore the public catalog within one working day; recover metadata within the last successful daily backup, at most 24 hours under normal operation. These are operational goals requiring a successful drill, not provider guarantees.

For a mistaken publication: withdraw its catalog entry and aid derivatives, invalidate snapshots/search, revoke external sharing where authorized, record the reason, review what became accessible, and publish corrected content only after review. For a leaked credential: revoke/rotate it, disable affected jobs, inspect redacted audit records, and verify access before resuming. Do not put credentials or sensitive incident details into public update feeds.

## 6. Privacy and account lifecycle for Phase 2

Collect an auth identifier, language preference, optional display name, and the learning records the student chooses to create. Keep technical logs separate from study records. Proposed technical-log retention is 14 days; retain personal study data until the student deletes it or an inactivity policy is explicitly agreed. Do not invent an inactivity deletion policy during implementation.

An authenticated deletion request should remove active personal records within seven days, with private backups expiring within the stated 30-day window. Record minimal deletion tombstones separately so restoring an older backup cannot resurrect deleted accounts; reapply those deletions before reopening service. These retention periods are proposals requiring owner agreement and any applicable legal review before launch.

An account export must contain only the requesting student's bookmarks, progress, and practice attempts in a portable format. It must exclude answer keys not yet disclosed, other students' data, admin comments, credentials, and private provider identifiers. Deleting a portal account does not delete the user's Google account or third-party NotebookLM history.

## 7. Implementation handoff checklist

- Resolve open decisions in [brainstorming](brainstorming.md) and date them.
- Confirm provider costs and account capabilities at build time.
- Complete the two-module M0 pilot from the [development plan](development-plan.md).
- Turn feature IDs into backlog items with acceptance criteria and phase dependencies.
- Establish the confirmed GitHub repository and GitHub → Coolify CI/CD workflow when implementation begins; first record repository details, release triggers, registry, and runner network access. Verify that the chosen commit maps to the image deployed by Coolify and that secrets, course PDFs, and student records are excluded from Git.
- Keep these docs updated when behavior changes; record a capability test date for each third-party integration.

No runtime deployment, OAuth configuration, Drive permission change, or automatic Moodle polling was performed while preparing this planning package.
