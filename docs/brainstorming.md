# UFC student platform — brainstorming

Started: 2026-09-26

Status: discovery. No implementation or technical stack has been approved.

## Confirmed intentions

- Help UFC Master 1 Semester 1 students find learning materials in one place.
- Use Google Drive for the main course PDF library.
- Incorporate NotebookLM learning aids per module and, where useful, per source.
- Support ongoing updates as Moodle publishes materials and assessments.
- Generate learning aids incrementally because NotebookLM generation is limited.
- Make the platform accessible to all UFC Master 1 S1 students, with sign-in for personal progress and browsing without a platform account.
- Prioritize organized courses, resources, and Moodle updates first; personal learning dashboards, quizzes, and progress tracking follow in Phase 2.
- Plan for a small monthly budget and automate routine work where supported. The exact budget ceiling is still open.
- Evaluate Google as the sign-in provider for personal learning features.
- Preserve brainstorming and future planning documents locally in this docs folder.
- Deploy on the ENSET-Skikda university server under Proxmox/Coolify, using a subdomain of an existing domain.
- Host the project source code on GitHub; this does not change the university deployment or Drive PDF storage.
- Use CI/CD from GitHub to Coolify. The pipeline's implementation details remain proposals to validate.
- The user will maintain content alone and check Moodle a few times per week.
- The user confirms permission to redistribute all currently intended materials; keep rights records for future additions and exceptions.

## Existing foundation

The local semester library is under `D:\My UFCs\Master\2027-2026 Master S1`, with eight module folders, notes, course covers, and PDFs.

- English / business-plan writing and presentation
- Advanced financial management
- Lean Startup
- International auditing standards
- Comparative accounting systems
- Deep learning applications
- Advanced corporate accounting 1
- International financial reporting standards 1

Portal: <https://mast-cmpt.ufc.dz/s1/>

Existing preferences: prepare resources locally before publishing; convert DOC/DOCX materials to PDF for the library; use course covers in notes. Existing resources and notes should be reused where suitable.

## Release direction — priorities confirmed, details proposed

Phase 1 focuses on course organization, resources, and Moodle updates. Phase 2 adds personal learning tools, including dashboards, quizzes, and progress tracking. Browsing is available to all UFC Master 1 S1 students; sign-in supports personal progress.

Suggested Phase 1 details:

An organized semester home page and eight module pages, searchable resource listings, course covers and overviews, official Moodle links, and a visible “recently added” feed. Publish a small selection of reviewed NotebookLM aids. Add a simple administrator review queue.

For Phase 2, consider bookmarks and self-reported progress alongside the dashboard and quizzes. A full assessment engine, recommendation system, discussion forum, and automated generation pipeline remain optional ideas requiring separate agreement. Routine automation should fit the small monthly budget and verified integration capabilities.

## Suggested architecture boundaries — to investigate

The detailed self-hosted proposal is now in [architecture.md](architecture.md) and [deployment-specification.md](deployment-specification.md): an Astro/Node application with Better Auth and a private PostgreSQL database on the confirmed university environment. The stack and resource sizing remain recommendations; Proxmox/Coolify and the existing-domain subdomain are confirmed hosting choices.

- Moodle: authoritative course and assessment source.
- Local library: preparation and review before publication.
- GitHub: confirmed host for application source code, with CI/CD to Coolify confirmed. Repository details, pipeline tooling, branch/trigger rules, and environment policy remain to be agreed or validated.
- Drive: approved PDF storage, with access behavior verified for the intended audience.
- Platform catalog/database: resource metadata, source relationships, versions, publishing status, and any personal learning records.
- NotebookLM: generation environment, with publishing through whatever supported sharing/export mechanisms are verified.

Google sign-in to the platform does not by itself establish access to every linked service. Determine Drive, Moodle, and NotebookLM access separately during planning.

### CI/CD implementation proposal

Use GitHub Actions to run checks and build a container image, publish an immutable image to a registry (GHCR is the candidate), request deployment through an authenticated Coolify integration, and verify the running release with health and smoke checks. Failed checks should prevent deployment, and deployment verification should support recovery to a known working release. GitHub Actions and GHCR are proposed implementation choices; the user confirmed the GitHub-to-Coolify direction. See the [deployment specification](deployment-specification.md) for detailed gates, credentials, deployment behavior, and rollback planning. No workflow, repository, account, or server configuration has been created.

## Suggested update workflow

1. Discover a candidate Moodle change through an authorized, supported method or a manual check.
2. Record the official link, module, change type, and discovery date.
3. Review access and content, detect duplicates, download locally where appropriate, and convert Word files to PDF.
4. Review the prepared resource, publish it to Drive, and update the platform catalog.
5. Identify learning aids affected by the source change. Queue only the useful missing or outdated aids.
6. Generate within available limits, review accuracy and presentation, then publish through a supported method.
7. Record the update and show students what changed.

Suggested generation priorities: missing high-value module overviews; aids tied to upcoming confirmed assessments; frequently used topics; optional alternate formats. These priorities are proposals, not automatic policy.

## Ideas to evaluate

- “What is new?” feed with dates and links to official sources.
- One consistent module page structure for Arabic, French, and English content.
- Source references and “reviewed on” dates on AI-generated aids.
- Bookmarks and a “continue studying” view, with progress described honestly as self-reported where applicable.
- Assessment calendar containing verified deadlines and links back to Moodle.
- Simple correction reporting, especially for AI-generated study materials.
- Lightweight PDF access and readable mobile layouts before elaborate interactive features.

## Clarifications

### Answered in this session

1. Audience and access: all UFC Master 1 S1 students; sign-in for personal progress.
2. First-release priority: organized courses, resources, and Moodle updates first, then personal learning tools (user response: “1 THEN 2”).
3. Budget and maintenance: small monthly budget; automate routine work. No numerical ceiling specified yet.
4. Hosting: existing ENSET-Skikda university server under Proxmox/Coolify, existing-domain subdomain. No separate managed web host is requested.
5. Content maintenance: user alone, checking Moodle a few times per week.
6. Redistribution: user has permission for all intended materials. Do not request this confirmation again; record exceptions for future additions if needed.
7. Source code: host the project on GitHub; the running app remains on the university Proxmox/Coolify environment.
8. CI/CD: GitHub to Coolify, confirmed on 2026-09-26.

### Next discovery questions

1. ~~Which interface language should be the default?~~ Answered 2026-10-03: Arabic.
2. How many students are expected initially?
3. Partly answered on 2026-09-29: notebooks exist for Lean Startup, English, and Deep Learning applications (see [notebooklm-workflow.md](notebooklm-workflow.md) §1). Each has audio and video overviews plus a study guide or quiz. Still open: which two or three formats matter most, and whether the existing artifacts can be shared publicly.
4. What is the exact subdomain, and what VM capacity, DNS access, outbound network access, and Coolify environment are available?
5. Who operates the university host and backups, and where can backups be stored outside the production host?
6. Is there a target launch date or existing developer expertise to account for?
7. What ceiling applies to any residual external-service or backup costs beyond the existing infrastructure?
8. Which exact days/times should implement the confirmed few-times-per-week cadence, and does Moodle provide an authorized API or feed?
9. ~~Which GitHub account or organization will own the repository, what should it be named, and should it be public or private?~~ Answered 2026-10-03: SamRepository/ufc-student-platform, public. For the confirmed GitHub-to-Coolify CI/CD direction, validate the proposed GitHub Actions and registry implementation and agree branch/trigger rules and environment policy.

Assessment submissions and private grades remain excluded from the proposed first two phases. Reopen that scope only if the user requests it.

## Validation required before technical commitments

Verify current official documentation and actual account settings for NotebookLM sharing/export/embedding, generation limits and any supported automation; Drive delivery and permissions; Moodle integration options; and authentication choices. Do not design around an assumed API or assume that every desired NotebookLM format is supported.

## Decisions

| Date | Decision | Status |
| --- | --- | --- |
| 2026-09-26 | Keep project brainstorming and future planning documents in this folder. | Requested by user |
| 2026-09-26 | Use Drive for main course PDF resources. | Requested by user |
| 2026-09-26 | Use incremental NotebookLM generation. | Requested by user |
| 2026-09-26 | Access for all UFC Master 1 S1 students; sign-in for personal progress. | Confirmed by user |
| 2026-09-26 | Phase 1: organized courses, resources, and Moodle updates. Phase 2: personal learning tools. | Confirmed by user |
| 2026-09-26 | Small monthly budget; automate routine work. | Confirmed by user; numerical ceiling open |
| 2026-09-26 | Google as authentication provider. | Candidate; not finalized |
| 2026-09-26 | ENSET-Skikda university server, Proxmox/Coolify, existing-domain subdomain. | Confirmed by user |
| 2026-09-26 | Host project source code on GitHub; university deployment and Drive PDF storage remain unchanged. | Confirmed by user; repository owner, name, and visibility open |
| 2026-09-26 | CI/CD from GitHub to Coolify. | Confirmed by user |
| 2026-09-26 | GitHub Actions checks/build, immutable image registry (GHCR candidate), authenticated Coolify deployment, and health/smoke verification. | Proposed implementation; branch/trigger rules and environment policy open |
| 2026-09-26 | Sole content maintainer; Moodle checks a few times per week. | Confirmed by user |
| 2026-09-26 | Permission to redistribute all intended materials. | Confirmed by user |
| 2026-09-26 | Astro/Node + PostgreSQL + Better Auth on the university environment. | Recommended; not yet accepted |
| 2026-09-26 | Detailed MVP scope, application stack, VM sizing, backup ownership, and specific automation mechanisms. | Open |
| 2026-09-29 | Planning review fixes: inventory corrected to 74 PDFs; minimum test viewport aligned to 320px; "revision" adopted as the schema term; NotebookLM pilot aligned with the M0 modules; conversion pilot requires a DOCX with tables/figures; sharing and repository scope exclude personal enrollment folders. | Documentation corrections |
| 2026-09-29 | Phase 1 as a static catalog from a Git manifest, with the database deferred to Phase 2 ([option](phase1-lightweight-option.md)). | Proposed; accepted 2026-10-03 (see below) |
| 2026-10-03 | Option B adopted: Phase 1 is a static Astro site built from a reviewed YAML manifest in Git; PostgreSQL, Better Auth and accounts move to Phase 2. | Confirmed by user |
| 2026-10-03 | Default interface language: Arabic (RTL), with French and English switchers. | Confirmed by user |
| 2026-10-03 | Application repository created locally at `D:\My UFCs\ufc-student-platform` (no GitHub remote yet); M0 pilot drafting started with English and Lean Startup. The planning docs are copied into its `docs/` folder, which is canonical from now on. | Confirmed by user |
| 2026-10-03 | Pilot catalog published: the 26 English and Lean Startup resources linked to their Drive files (matched by exact size and name) and set to `published`. The Drive folder is shared "anyone with the link → Viewer". Three damaged Drive names (Lean Startup units 02, 04, 12) were fixed to `.pdf`. Not yet deployed. | Approved by user |
| 2026-10-03 | GitHub repository: `SamRepository/ufc-student-platform`, public, default branch `main`. Withdrawn resources and their Drive IDs remain visible in the public git history. | Confirmed by user |

## Planning package produced

On 2026-09-26, the attached prompt was used to produce the [detailed development plan](development-plan.md), [feature specifications](feature-specifications.md), [architecture](architecture.md), [deployment specification](deployment-specification.md), [content workflow](content-workflow.md), [NotebookLM workflow](notebooklm-workflow.md), and [validation/operations plan](validation-and-operations.md). The documents record confirmed choices separately from proposed implementation details. No app, hosting service, integration, or scheduled job has been deployed.
