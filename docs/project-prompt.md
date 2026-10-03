# Planning prompt — UFC Master 1 S1 student platform

Act as a product strategist and technical architect. Help me turn the following idea into a realistic, maintainable web application plan. Start with discovery and planning; do not implement the app until we agree on the scope.

## Project vision

I want to create a shared learning platform for students in UFC Algeria's Master 1, Semester 1 accounting program. It should bring course materials, learning aids, assessments, exercises, and updates together in one clear, mobile-friendly place.

I already maintain a local course library and a corresponding shared Google Drive folder. The library contains eight modules, course PDFs, module notes, course covers, and links to Moodle. Moodle remains the authoritative source for official course materials and assessments. Treat this as a student initiative unless institutional authorization is established.

## Content and learning experience

Confirmed direction: make the platform accessible to all UFC Master 1 S1 students, with sign-in for personal progress rather than required for browsing. Prioritize organized courses, resources, and Moodle updates in Phase 1; introduce personal dashboards, quizzes, and progress tracking in Phase 2. Plan for a small monthly budget and automation of routine work; the exact budget ceiling remains to be agreed.

Confirmed hosting and operations: deploy on the ENSET-Skikda university server under Proxmox/Coolify, on a subdomain of an existing domain. I will maintain the content myself and check Moodle a few times per week. I have permission to redistribute all intended materials. Plan around this hosting environment instead of assuming a paid managed application/database host; confirm available capacity, host administration, backup arrangements, and any residual external-service costs. Keep sharing records for future resources and do not infer official UFC endorsement from the hosting location.

Confirmed source-code hosting and CI/CD: host the project source code on GitHub and use CI/CD from GitHub to Coolify, confirmed on 2026-09-26. The running app remains on the university Proxmox/Coolify environment, and course PDFs remain in Google Drive. Repository owner, name, and public/private visibility are still open. Refine and validate the proposed workflow: GitHub Actions checks and container build, publication of an immutable image to a registry (GHCR is the candidate), authenticated Coolify deployment, and health/smoke verification. GitHub Actions, GHCR, branch/trigger rules, and environment policy are implementation proposals, not individually confirmed choices. Define deployment gates, secrets handling, migration safety, and recovery to a known working release. Keep credentials and student private data out of the repository.

- Use Google Drive as the primary storage location for course PDFs. Evaluate what additional storage or database is needed for the resource catalog, user profiles, progress, and update history.
- Give each module a page with its cover, overview, organized resources, official Moodle links, and available learning aids.
- Use NotebookLM to prepare learning aids incrementally: mind maps, reports, audio and video overviews, slides, quizzes, flashcards, and other useful formats that are actually supported. Some aids may cover a whole module; others may cover one source or topic.
- Make supported NotebookLM outputs accessible through embedding, published links, or exported files, depending on verified capabilities and access permissions.
- Clearly distinguish official course content from AI-generated study aids. Link generated aids to the source documents and source versions they use, and include a review status.
- In Phase 2, add sign-in and a personal dashboard for learning progress. Evaluate Google as the preferred sign-in candidate, and propose bookmarks, completed exercises, and revision priorities for agreement. Keep browsing accessible without a platform account; separately verify permissions for linked services and materials.
- Support Arabic, including right-to-left layouts, French, and English. Prioritize usability on phones and slower connections.

## Updates and generation workflow

Design a practical workflow for discovering new or changed Moodle files, exercises, assessments, and deadlines; reviewing them; storing approved materials; and updating the platform.

Use a local-first ingestion process before publishing to Drive. Preserve the existing preference to convert DOC and DOCX resources to PDF for the course library. Track source URLs, module, title, publication or discovery date, version, and update status. Handle duplicates, replacements, removed resources, and corrections.

NotebookLM generation should be incremental because generation limits and available time constrain the process. Propose a queue that prioritizes useful missing aids and identifies existing aids that may be outdated when their sources change. Avoid regenerating everything after every update. Show what is available, pending, or awaiting review.

Separate discovery, human review, publishing, and generation. Explain which steps can reliably be automated and which should remain manual. Do not assume Moodle scraping, NotebookLM automation, APIs, embeddings, or sharing behavior are available: verify current capabilities using official documentation before recommending an integration. Provide a workable manual fallback for unsupported integrations. Never bypass access controls or expose credentials.

## Planning approach and deliverables

1. Ask a short, prioritized set of clarification questions about remaining scope details, server/domain access and capacity, GitHub repository details, pipeline policies, backup ownership, residual service budget, and success criteria. Do not re-ask the confirmed audience, phase priorities, hosting direction, GitHub source-code hosting, GitHub-to-Coolify CI/CD direction, content-maintenance cadence, or permission for intended materials. Distinguish confirmed requirements from suggestions and assumptions.
2. Suggest improvements that support student learning without making the first release unnecessarily complex.
3. Define an MVP and later phases, with concrete student and administrator journeys and acceptance criteria.
4. Compare a small number of suitable technical approaches. Recommend one based on cost, simplicity, maintenance, and integration constraints; do not choose a stack prematurely.
5. Propose the information architecture, resource catalog and progress data model, authentication and roles, search, and content publication workflow.
6. Define an incremental NotebookLM workflow, including source selection, prioritization, review, version tracking, and publication.
7. Address appropriate redistribution permissions, restricted materials, student privacy, minimal data collection, and account deletion. Distinguish assessment instructions from student submissions and private grades.
8. Produce a phased roadmap, indicative costs and effort, risks, unresolved decisions, and a concrete first milestone.
9. Specify the GitHub-to-Coolify CI/CD flow and its acceptance criteria, while clearly identifying proposed tooling and policies. Verify current integration capabilities against official documentation before implementation. Planning does not authorize creating a repository, configuring accounts or servers, or deploying the application.

Save our brainstorming, decisions, and future planning documents under `D:\My UFCs\docs\ufc-student-platform`. Maintain an index, date decisions, and keep open questions visible. Do not turn suggestions into requirements until I accept them.
