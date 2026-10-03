# UFC Master 1 S1 platform — development plan

Version 1.1 · 2026-09-26, corrected 2026-09-29 · Planning proposal, not authorization to build or deploy.

## 1. Recommended direction

Build a small, public course portal around the library you already maintain. Make finding the right official resource the main job of the first release. Publish selected, reviewed NotebookLM learning aids beside their sources. Introduce student accounts and personal learning tools in a second release.

Use Drive for course files and a separate database for the catalog, publication history, generation queue, and eventually personal progress. Start with a reviewed ingestion workflow that works manually; automate discovery and preparation only where the available services support it. The first release must remain useful without a Moodle API or an automated NotebookLM generator.

This document sets direction, sequence, estimates, and decisions. The linked specifications define behavior in more detail:

- [Feature specifications](feature-specifications.md)
- [Architecture, data model, and API boundaries](architecture.md)
- [University server deployment specification](deployment-specification.md)
- [Moodle, local library, and Drive workflow](content-workflow.md)
- [NotebookLM generation and publication workflow](notebooklm-workflow.md)
- [Validation and operations](validation-and-operations.md)

## 2. Confirmed requirements and planning assumptions

**Source code hosting:** GitHub is confirmed as the project's source-code host. Keep the application code, database migrations, tests, deployment configuration templates, and project documentation in the repository. Repository owner, name, and public/private visibility remain to be chosen. Application hosting remains on the ENSET-Skikda Proxmox/Coolify environment; course PDFs remain in Google Drive.

**CI/CD:** GitHub → Coolify is confirmed. Plan automated checks and image builds on GitHub, followed by deployment to Coolify only after successful validation. GitHub Actions and GHCR are the proposed implementation tools; release triggers, image-registry choice, and runner access to the university network must be finalized during the pilot.

**Confirmed:** target UFC Algeria Master 1 Semester 1 accounting students; browsing without a platform account; sign-in for personal progress; course organization and updates before personal learning tools; Drive for primary PDFs; incremental NotebookLM generation; local preparation before publication; Word resources converted to PDF; Arabic, French, and English support; mobile usability; routine automation; deployment on the ENSET-Skikda university server under Proxmox/Coolify, using a subdomain of an existing domain. The user will maintain content alone and check Moodle a few times per week. The user confirms permission to redistribute all intended materials.

**Proposed:** Astro and TypeScript in a Node container, PostgreSQL for the catalog, Better Auth for Google authentication, a dedicated Linux VM managed through Coolify, Arabic as the initial interface default with a language switcher, and an initial capacity exercise of 100–500 students. These are planning assumptions, not user decisions or verified enrollment numbers. Prefer reuse of an existing approved Coolify service if available; the exact VM allocation requires the server administrator's capacity review.

**Still open:** exact subdomain, available server capacity and deployment access, responsibility for host operations/backups, residual service/backup budget, expected student count, default interface language, target launch date, Moodle integration permissions, and actual NotebookLM plan/features. Content rights and sole-maintainer cadence are settled; future resources still need their sharing status recorded. University hosting does not itself establish UFC endorsement or Moodle administrator rights.

Treat the portal as an independent student initiative. Do not imply university endorsement. Preserve original course names and dates even when the source is inconsistent; explain discrepancies in reviewed notes.

## 3. Existing assets and migration baseline

A read-only inventory on 2026-09-26 found the following under `D:\My UFCs\Master\2027-2026 Master S1`:

| Module | PDF files, including notes |
| --- | ---: |
| English / business-plan writing and presentation | 10 |
| التسيير المالي المعمق | 11 |
| المؤسسات الناشئة المرنة (Lean Startup) | 16 |
| المعايير الدولية للتدقيق | 8 |
| النظم المحاسبية المقارنة | 9 |
| تطبيقات التعلم العميق | 12 |
| محاسبة الشركات المعمقة 1 | 6 |
| معايير إعداد التقارير المالية الدولية 1 | 2 |
| **Total** | **74** |

Each module also has one Markdown notes file and one course-cover image. These counts describe local files, not unique official lessons or a verified complete Moodle inventory. The eight notes PDFs are included in the 74. Drive was not re-inventoried in this planning session.

Correction, 2026-09-29: the original count of 71 missed Lean Startup units 02, 04, and 12, whose files had damaged `.pdf_` / `.pdf _` extensions. They were valid PDFs and have been renamed to `.pdf`, so the module now has all 12 units shown on Moodle. The already-filed `Master\Incoming` items were moved to `Master\Archive\Incoming processed 2026-09-29`.

Known source discrepancies for the migration manifest:

- The Moodle download named `المقطع 8.pdf` for التسيير المالي المعمق contains lesson 7, part 2. The library files it correctly as `المقطع 7 - الجزء الثاني - طرق تقييم المشاريع الاستثمارية.pdf`, while the library's `المقطع 8.pdf` is lesson 8 (financial-failure prediction models). Record the Moodle label as the source title and the verified lesson identity separately.
- محاسبة الشركات المعمقة 1 mixes segments labelled 2025-2026 (01–02) and 2024-2025 (03–05). Record the academic year shown on each file as metadata; do not assume the older segments are outdated or replaced.

Migration must produce a reviewed manifest mapping each local file to a stable module/resource ID, original Moodle URL if known, Drive file ID if known, language, type, checksum, and permission status. Do not infer official lesson identity from filenames alone. Keep the existing folders and user-edited notes intact. Use explicit catalog ordering so notes appear first without depending on alphabetical filename order.

## 4. Product scope and student journeys

### Phase 1 — course portal and updates

A student opens the semester page on a phone, chooses a module, reads its cover and overview, finds a course PDF or official activity link, and sees recent changes. They can search across module titles, resource titles, topics, and reviewed summaries. Available learning aids are labeled as AI-generated, reviewed or outdated, and linked to their official sources.

An administrator records or discovers a change, prepares the file locally, reviews conversion and permissions, uploads or associates the approved Drive version, previews the catalog update, and publishes it. A source change creates a review task for dependent learning aids; it does not silently replace them.

Required launch behavior: eight consistent module pages; published-resource catalog and filters; notes pinned first; recent updates and last successful check; honest access labels; official assessment instructions/deadlines where verified; selected reviewed learning aids; administrator sign-in and publication controls; mobile/RTL accessibility; recovery and rollback procedure.

Student sign-in is not needed to browse Phase 1. Administrator authentication is needed from the first release. Automated reminders or discovery can be added within Phase 1 once the supported connection and cadence are agreed; human content review remains part of publication.

### Phase 2 — personal learning

A student signs in, bookmarks resources, marks study items as completed, returns to a personal dashboard, and takes reviewed practice quizzes or uses flashcards. Progress belongs to that student and remains private. A click to an external PDF or NotebookLM activity is not proof of completion or a quiz result.

Native portal quizzes require their own reviewed question schema and scoring implementation. Linking to a NotebookLM quiz alone does not provide portal-side scores. Keep these distinctions visible in the feature specification and dashboard.

### Later options

Consider configurable update notifications, downloadable revision packs, additional semesters, selected offline reading, richer practice, and student correction suggestions after the first two phases demonstrate value.

### Outside the initial scope

Official assignment submission or grades, Moodle password collection, exam-answer distribution, a replacement LMS, automatic generation of every format for every source, an AI chat engine hosted by the portal, a social network, native phone apps, and undocumented NotebookLM automation.

## 5. Technical approach comparison

| Approach | Fit | Main tradeoff | Recommendation |
| --- | --- | --- | --- |
| Static catalog with reviewed metadata files and Drive links | Fast resource-only prototype; very low infrastructure needs | Editing and approvals remain developer-oriented; personal features need a backend later | Useful fallback if budget or accounts block the managed approach |
| Astro/TypeScript + Node + PostgreSQL + Better Auth, deployed with Coolify | Public content pages, a small admin interface, and a path to personal features on the confirmed university server | Team owns patching, backups, and server availability | Preferred proposal, subject to the integration pilot and host capacity |
| React/Next.js + PostgreSQL and a supported auth library, deployed with Coolify | Suitable if the builder already knows it or interactive features dominate | More client/application machinery for the initial content-heavy release | Valid alternative; choose it for team expertise, not perceived necessity |

Better Auth documents integration with Astro and PostgreSQL. This supports a small self-hosted application design; the integration pilot must still prove the selected versions, Google callback, session handling, and deployment. [Astro integration](https://better-auth.com/docs/integrations/astro), [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql). The proposed deployment uses the user's chosen Proxmox/Coolify environment; it does not require a managed cloud application or database subscription.

Use one codebase and one primary application database. Keep document conversion on the local Windows machine, not in a web request. Add a small scheduled worker on the university VM only for supported remote discovery and queue housekeeping; local preparation remains local. Avoid adding an automation platform, vector database, or media streaming service until a specific need justifies it.

## 6. Delivery roadmap and effort

Estimates are planning judgments for one experienced developer, excluding waiting for access approvals and prolonged academic review. They are not a quote. Each stage produces reviewable results; this planning task has not started implementation.

| Stage | Deliverables and exit condition | Effort |
| --- | --- | ---: |
| M0: integration and content pilot | Manifest template; two representative modules; signed-out file access tested; one Word conversion; one reviewed NotebookLM output; manual update path; host/network/callback feasibility and stack decision recorded | 16–24 hours |
| M1: public experience | Three-language UI structure; module/resource page layouts; catalog/search prototype; cover/notes ordering; phone and RTL review | 20–30 hours |
| M2: content administration | Database migrations; admin authentication; staging/review/publication; version mapping; failed-job handling; proposed connector/manual import; Coolify staging deployment and backup | 32–48 hours |
| M3: complete Phase 1 | Import all eight modules; rights/access audit; update feed; assessed-activity links; reviewed learning aids; accessibility, restore and pilot testing | 24–36 hours |
| M4: pilot corrections | Small voluntary student pilot; fix navigation, content, and access problems; publish operator guide and agree launch readiness | 8–14 hours |
| M5: Phase 2 | Student sign-in; private bookmarks/progress; dashboard; native practice questions/flashcards; account export/deletion and isolation tests | 50–80 hours |

Phase 1 totals **100–152 hours before contingency**, or approximately **120–183 hours with 20% contingency**. At 15 development hours per week this is roughly 8–13 weeks, rounded up. Phase 2 adds approximately 60–96 hours with contingency. Actual pace depends heavily on content review, developer familiarity, and availability of the university host administrator. These figures assume a usable existing Proxmox/Coolify environment, not a new campus infrastructure installation.

Choose two contrasting modules for M0: English for Latin-script PDFs and Lean Startup for Arabic content, richer notes, and learning aids. Test conversion with an authorized Arabic DOCX that contains at least one table and one figure, such as the next Word file published on Moodle. The existing Deep Learning introduction (`00- تقديم الدرس.pdf`) is not a sufficient sample: its source DOCX has no tables or images, and it was converted by reflowing paragraph text only, so it cannot demonstrate the layout, table, and figure checks required by F-06. Do not overwrite any archived PDF during the pilot.

Implementation dependency map: M1 covers F-01–F-04 and F-14; M2 establishes F-06/F-07/F-10 before enabling F-05 discovery and F-08/F-09 aid publication; M3/M4 complete those Phase 1 features plus F-15 operational checks. M5 implements F-11 before F-12/F-13 personal learning. Feature definitions and testable criteria are in [feature-specifications.md](feature-specifications.md). The pilot and administration foundations come before bulk import or automated publication.

## 7. Indicative operating costs

The confirmed university hosting removes the need to plan for a separate paid web-hosting subscription. It does not remove storage, backup, administration, power, or capacity costs. The exact cost allocation is an institutional decision, not assumed to be free.

| Item | Planned approach | Cost treatment |
| --- | --- | --- |
| App and PostgreSQL | Existing university server VM, containers managed by Coolify | No additional managed app/database subscription proposed; capacity/allocation to confirm |
| Coolify control plane | Existing or approved self-hosted instance | No recurring self-hosted platform subscription; operations remain the host team's responsibility |
| Public hostname/TLS | Subdomain of existing domain | No separate domain purchase planned; DNS/TLS arrangement to confirm |
| Backup destination | Approved storage outside the production VM/host failure domain | Unknown until university backup availability is confirmed; obtain a quote only if external storage is needed |
| Drive and NotebookLM | Existing accounts where adequate | Existing subscriptions plus any explicitly chosen upgrade; not automatically changed |
| Local preparation | Existing PC, when available | Owner time and power; no always-on machine assumed |
| Operator maintenance | Content checks a few times per week; estimate 1–2 hours/week plus review and generation | Measure during pilot; infrastructure maintenance belongs to an explicitly named operator |

Coolify describes self-hosting as having no recurring platform subscription cost while assigning maintenance and backup responsibility to the operator. [Coolify deployment choices](https://coolify.io/docs/choose-your-path). API quotas and paid options must still be checked for the actual Google project/accounts during the pilot; existing service access is not a guarantee of unlimited use.

Planning baseline: **zero additional app-hosting/domain subscriptions proposed**, with backup/storage and existing Google subscription costs to be confirmed. Do not describe the whole service as costing zero. Prefer existing institutional backup facilities if adequate, use bounded scheduled jobs, and review external-service usage monthly. Do not purchase or provision anything during planning.

## 8. Main risks and responses

| Risk | Response and decision point |
| --- | --- |
| Moodle offers no authorized API/feed | Release with manual signed-in discovery and a structured import queue; pursue an authorized connector separately |
| A future resource falls outside the confirmed sharing permission | Record the current confirmed permission baseline; check exceptions/new terms and use official links where redistribution is not covered |
| NotebookLM sharing or generation differs by account | Verify actual artifacts; support external links and permitted exports; maintain manual generation |
| Source changes make an aid inaccurate | Pin its source revisions, flag it for review, and hide misleading outputs until corrected |
| Drive link permissions or availability change | Access labels, periodic checks, student report path, and original Moodle fallback |
| Local PC is asleep/offline | Display last successful check; resume bounded work later; do not promise real-time updates |
| University VM, DNS, or public ingress is unavailable | Resolve with the host administrator in M0; isolate the app from the Proxmox management plane and verify restore/maintenance ownership |
| Administrator workload grows | Limit formats, prioritize the queue, measure review time, and add another maintainer only with explicit roles |
| Student records are exposed | Database policies, server authorization, minimal collection, private backups, and cross-user tests before Phase 2 |

## 9. Success criteria and next decisions

Proposed Phase 1 targets: all eight modules represented; every public file has recorded sharing status and a verified destination; a pilot student finds a named resource within one minute; no critical phone/RTL/access defects; a normal reviewed update is published in under ten minutes of operator work excluding download/conversion/generation; and failed discovery never appears as “no new resources.” These are targets to validate, not promises of current behavior.

Before implementation, confirm the subdomain, VM/network capacity, host operations/backup ownership, any residual paid-service ceiling, default language, initial user scale, and stack recommendation. The sole content maintainer, a few checks per week, and permission for intended materials are already confirmed. Then run M0 before building the full interface. Google OAuth remains the preferred candidate, while the final provider configuration is a technical decision to validate in that pilot.

The concrete next milestone is **two complete module examples and one end-to-end reviewed update**, with a documented cost and access result. That will resolve the largest uncertainties before committing to the full build.
