# UFC Master 1 S1 student platform — planning package

Updated: 2026-10-03 · Status: M0 pilot drafting started (Phase 1 Option B, static catalog). The application repository is at `D:\My UFCs\ufc-student-platform`; its `docs/` folder holds the canonical copy of these documents from 2026-10-03 onward.

## Start here

Read the [development plan](development-plan.md) for the proposed product, phases, effort, costs, risks, and first milestone. Read the [feature specifications](feature-specifications.md) for the behavior and acceptance criteria an implementer should follow once scope is agreed.

## Documents

| Document | Purpose |
| --- | --- |
| [Development plan](development-plan.md) | Vision, existing library inventory, MVP and later phases, technical options, milestones, estimates, costs, risks |
| [Feature specifications](feature-specifications.md) | Fifteen features with IDs, journeys, fields, states, and acceptance criteria |
| [Architecture](architecture.md) | Application components, routes, data model, roles, APIs, privacy and search |
| [Deployment specification](deployment-specification.md) | ENSET-Skikda Proxmox/Coolify environment, containers, domain/TLS, resource sizing, backups, deployment and rollback |
| [Content workflow](content-workflow.md) | Moodle discovery, local preparation, Word-to-PDF conversion, Drive publication, updates and removals |
| [NotebookLM workflow](notebooklm-workflow.md) | Verified capabilities, source provenance, incremental generation, limits, reviews and sharing |
| [Validation and operations](validation-and-operations.md) | Tests, launch gates, maintainer routines, recovery, retention and handoff |
| [Phase 1 lightweight option](phase1-lightweight-option.md) | Accepted 2026-10-03: static catalog from a Git manifest for Phase 1, with the database deferred to Phase 2 |
| [Brainstorming and decisions](brainstorming.md) | Confirmed choices, proposals and remaining questions |
| [Reusable planning prompt](project-prompt.md) | Original planning brief, updated with the user's clarified requirements |

## Confirmed project direction

Public browsing for all UFC Master 1 S1 students; personal sign-in features in Phase 2. Phase 1 prioritizes course resources, Moodle updates, and selected reviewed learning aids. Drive stores the course PDFs; NotebookLM generation is incremental. Content is prepared locally, with Word documents converted to PDF for publication.

The project source code will be hosted on GitHub, with CI/CD from GitHub to Coolify confirmed on 2026-09-26. Deployment is on the ENSET-Skikda university server under Proxmox/Coolify, using a subdomain of an existing domain. The user maintains content alone, a few times per week, and confirms permission to redistribute all intended materials. Hosting does not imply institutional endorsement of the portal or grant Moodle administrator access.

The proposed CI/CD implementation is GitHub Actions checks and container build, publication of an immutable image to a registry (GHCR is the candidate), an authenticated Coolify deployment, and health/smoke checks. GitHub Actions, GHCR, branch and trigger rules, and environment policy are implementation proposals; repository owner, name, and visibility remain open. See the [deployment specification](deployment-specification.md) for the detailed workflow.

Exact VM capacity, initial student scale, host/backup ownership, and exact subdomain also remain to be agreed or verified. Phase 1 is a static Astro site built from a Git YAML manifest (Option B, accepted 2026-10-03); PostgreSQL and Better Auth are Phase 2 proposals. Arabic is the default interface language (2026-10-03).

## How to use and maintain these documents

The planning package was prepared from the user's attached prompt and session clarifications. Current third-party claims have official links near them and were checked on 2026-09-26. Account-specific access, university infrastructure, and the UFC Moodle configuration still require a pilot; documentation research is not a live integration test.

Start implementation with the two-module integration pilot defined in the development plan. Date accepted decisions and update dependent specs together. Preserve user edits. Keep confirmed requirements, suggestions, and unverified assumptions distinct. Never store passwords, tokens, cookies, or student private records in this docs folder. When the repository is created, commit only the application and these docs. Never commit course files, `Master\Links`, or the personal enrollment documents in `Master\Inscription 2026-2027` and `Master\UFCM1`.
