# Feature specifications — UFC Master 1 S1 student platform

Date: 2026-09-26  
Status: planning draft for scope agreement; no implementation authorized by this document.  
Audience: product owner, designer, implementer, and content reviewer.

The confirmed direction is public browsing for UFC Master 1 Semester 1 students, eight module libraries backed primarily by Google Drive, and Moodle as the authority for official materials and assessments. Phase 1 prioritizes courses, resources, updates, and selected reviewed NotebookLM aids. Phase 2 adds student sign-in, dashboards, quizzes, and progress. A small monthly budget and routine automation are preferred; the ceiling remains open.

The user has also confirmed hosting on the ENSET-Skikda university server using its existing Proxmox/Coolify environment and a subdomain of an existing domain. Samir is the sole maintainer and can review work a few times weekly. The user confirms permission for all currently intended materials. These confirmations establish the operating context; server capacity, deployment access, backup destinations, and OAuth configuration still need technical verification. University hosting does not establish institutional endorsement of this student initiative.

All detailed behavior, field names, thresholds, and optional enhancements below are **proposed specifications**, not additional user-approved requirements. The acceptance criteria describe how to verify a feature if adopted. Integration choices depend on the capability checks and permissions documented elsewhere in this planning folder.

## 1. Scope, roles, and shared rules

**Visitor:** browses approved public content, searches, follows official links, and opens published aids. A platform account must not be required for these actions. External services may impose their own sign-in or permissions.

**Student, Phase 2:** has visitor access plus private bookmarks, personal progress, and supported native practice activities. Google sign-in is the preferred candidate to evaluate; a Google account does not establish UFC enrollment.

**Maintainer, Phase 1:** Samir, the confirmed sole maintainer, reviews discoveries, corrects metadata, manages versions, queues generation, and publishes or withdraws content a few times weekly. Maintainer authentication is required even though student sign-in comes later. The same person can perform every editorial step; the interface must still record review and publication separately. Queue work for these review sessions rather than assuming daily manual coverage.

**Reviewer, optional later role:** may approve content or aid quality without managing accounts. Do not build complex roles until multiple maintainers need them.

Shared rules:

- The user's confirmed permission covers the currently intended materials. Record that confirmation against the initial inventory; do not reopen it as an unanswered launch blocker. Continue tracking rights and audience for future additions, derivatives, or changed permissions. Possessing a new Moodle download or Drive link alone is not evidence of permission to redistribute it.
- Restricted content may have an approved public description and an official access link. Hidden files, private notes, and restricted metadata must never reach public responses or search indexes.
- Display official resources, curator notes, and AI-generated aids as distinct origins. An official source cited by an AI aid does not make that aid official.
- Use stable internal identifiers. A renamed file, revised title, or replaced URL must not break bookmarks or silently reset progress.
- Record times consistently and display an explicit timezone for deadlines. Missing dates remain unknown; discovery time is not an official publication date.

## 2. Phase 1: public library and controlled publishing

### F-01 — Semester home and module navigation · P1 core

**Story:** As a visitor, I can identify my semester, open any of its eight modules, and find recent course changes on my phone.

**Information:** semester identifier and display name, academic year when verified, module identifier, multilingual title, cover, short description, resource counts, and latest approved update. Show a concise student-initiative notice and direct Moodle portal link.

**Behavior and states:** Display all eight modules in a stable order. A module with no publishable resources remains navigable with an honest empty state. A missing cover uses a consistent placeholder. Count only content the visitor can access through the public catalog.

**Acceptance criteria:** Every module can be reached from the home page without signing in; navigation remains usable with a keyboard and a narrow phone viewport; a module name is always visible independently of its cover; an unavailable image does not remove its link or text.

### F-02 — Module page and featured notes · P1 core

**Story:** As a visitor, I see an orientation to the module before choosing lectures, exercises, or learning aids.

**Information and order:** Main course title; course cover directly below it; overview; featured module-notes PDF; official materials grouped by topic or resource type; official exercises and assessments; available study aids; module-specific updates and Moodle link. Overview fields may include instructor, objectives, prerequisites, credits, and coefficient only where verified. Preserve conflicting source information for review instead of reconciling it by guesswork.

**Behavior and states:** Notes receive an explicit featured position rather than relying on Drive filename sorting. Unknown metadata is omitted or labeled “not verified.” Empty exercise and aid sections explain that nothing has been published on this platform yet; they must not claim Moodle has no such content.

**Acceptance criteria:** The notes PDF appears before ordinary lecture files; cover placement is consistent across eight modules; all published resources belong to the intended module; editing an overview leaves resource identifiers and student records intact.

### F-03 — Resource catalog, viewing, and access · P1 core

**Story:** As a visitor, I can understand a resource, open the current approved version, and return to its official source.

**Fields:** resource ID, module ID, original title, optional translated title, language, type, topic/order, origin, official source URL, discovered date, known publication date, current version ID, file format/size/pages when known, Drive file ID or approved destination, access label, and publication status. Each version records checksum, acquisition time, source filename, replacement relationship, and conversion details when applicable.

**Behavior and states:** Provide “Open PDF” and “Official source” actions with accurate destination labels. Preview is optional and must have a link fallback. Do not promise a download action when only viewing is supported. Validate URLs, reject executable URL schemes, escape displayed content, and restrict approved destination patterns without fetching arbitrary administrator-entered URLs unrestrictedly.

**Acceptance criteria:** An invalid or withdrawn destination cannot be published; a replaced version is clearly identified; a broken external link produces a useful fallback without exposing credentials; a Drive permission change is surfaced for review; public browsing is checked in a signed-out session. Platform sign-in must never imply access to a restricted Drive file or Moodle course.

### F-04 — Search and filtering · P1 core

**Story:** As a visitor, I find material even when my query uses Arabic spelling variants or a French or English title.

**Scope:** Search approved catalog metadata, module titles, verified tags, and reviewed summaries. Full PDF text search and OCR are later options, not an MVP assumption. Filters cover module, content type, language, and official resource versus study aid.

**Proposed matching:** Preserve original text. Build a separate normalized Arabic search representation removing diacritics and tatweel and normalizing common alef variants. Evaluate alif-maqsura/ya equivalence with representative course titles before enabling it. Use case-insensitive Latin matching and evaluate accent-insensitive matching. Prefer exact title matches over normalized or tag-only matches.

**Acceptance criteria:** Agreed Arabic/French/English sample queries find the intended resources; titles display their original spelling; filters combine predictably and can be cleared; no-result pages retain the query and suggest fewer filters; drafts and withdrawn items never appear in public results. Do not claim the PDF body was searched.

### F-05 — Moodle updates and assessment notices · P1 core

**Story:** As a visitor, I can distinguish a new lecture from an assessment notice and open the authoritative instructions.

**Fields:** update ID, module, category, reviewed title/summary, source URL, official publication date if known, discovery time, review time, last checked time, and related resource/version IDs. Assessment notices additionally hold assessment type, opening/closing dates if verified, timezone, and whether the deadline is unknown or changed.

**Behavior and states:** Separate “new,” “revised,” “removed,” and “corrected” events. Display a visible “last checked” value for each monitored module. A failed check retains the previous check time and explains that updates may be incomplete. An assessment notice links to Moodle; it does not collect submissions or invent assessment availability from a calendar absence.

**Acceptance criteria:** Discovery and official dates are never conflated; a corrected deadline records its previous value in the administrative history; unknown deadlines do not trigger fabricated countdowns; Moodle remains the submission destination; private grades, submissions, and other students’ activity are neither imported nor displayed.

### F-06 — Local-first intake and version review · P1 core

**Story:** As a maintainer, I can prepare a new or changed Moodle resource locally, inspect it, and decide whether it is publishable.

**Journey:** Discover or manually register source → save original to local intake → identify module and resource → detect duplicates → convert DOC/DOCX to PDF → inspect output → verify metadata/access → mark reviewed. A discovery connector is optional; a manual source URL and local file path must be sufficient.

**Fields:** intake ID, source URL, module, local original/output paths, detected format, checksum, discovery method/time, related existing resource, conversion outcome, reviewer, review notes, permission decision, and status. Proposed states: discovered, acquired, conversion-needed, review-needed, blocked, approved, rejected, duplicate.

**Acceptance criteria:** Exact duplicate content creates no duplicate public resource; an uncertain replacement awaits review; originals are retained outside the final PDF library according to an agreed retention policy; a failed conversion cannot be approved as completed; reviewers check Arabic shaping, page completeness, figures, and orientation; no DOC/DOCX is placed in the final course archive. A revised source never silently overwrites the prior version record.

### F-07 — Publishing, correction, and withdrawal · P1 core

**Story:** As a maintainer, I can publish only the approved version and repair mistakes without losing history.

**Journey:** Approved intake → upload or locate approved Drive PDF → verify link permissions as intended → preview public catalog entry → publish catalog/update → mark related aids for source-change review. Record each step independently so an interrupted job can resume safely.

**Fields:** publication status, permission evidence or decision reference, reviewed-by/at, published-by/at, Drive destination, current version, action log, and withdrawal/correction reason. Proposed publication states: draft, reviewed, ready, published, withdrawn.

**Acceptance criteria:** Unreviewed items cannot publish; a failed upload leaves the existing public version usable; retries do not create repeated catalog records; withdrawing a resource removes public file links and search results while retaining an appropriate change notice; rollback restores a reviewed version and reassesses affected aids. The log identifies actor, time, target, action, and outcome without storing tokens or private assessment content.

### F-08 — NotebookLM generation queue · P1 core, initially manual execution

**Story:** As a maintainer, I spend limited generation capacity on useful missing or outdated study aids.

**Fields:** queue ID, module, aid format, scope (module/topic/individual source), selected source version IDs, notebook reference, language, requested purpose, priority/reason, estimated effort, status, last attempt, blocked reason, and resulting aid ID. Available formats must be verified rather than assumed from this wish list.

**Behavior:** Prioritize foundational coverage, student demand, and approaching verified assessments; allow manual priority changes. Deduplicate requests for the same source set, purpose, format, and language. Use the canonical job, review, and freshness states in [notebooklm-workflow.md](notebooklm-workflow.md); the UI can group intermediate states into “Awaiting review” without collapsing their stored history. Capacity exhaustion preserves the queue and records a resumable reason. Execution may be manual; automatic generation requires separately verified, supported access.

**Acceptance criteria:** Changing one source flags only dependent aids; a flag requests review rather than automatically regenerating everything; the source version set used for an output is immutable; unsupported formats or unavailable capacity are visible to the maintainer; the public page never promises an unconfirmed completion date.

### F-09 — Reviewed study-aid publication · P1 core

**Story:** As a visitor, I can use a study aid while understanding its sources, limits, and currency.

**Fields:** aid ID, module/topic, title, format, language, source version IDs, generated date, reviewed date/reviewer, review status, source-currency status, availability, and delivery mode (verified embed, external link, or exported file). Treat these states separately: an aid can be quality-reviewed yet outdated or temporarily unavailable.

**Review:** Verify terminology, accounting calculations where present, consistency with source explanations, misleading omissions, Arabic/French readability, and any quiz answer keys. Record corrections or reject the aid. Never imply that a generated overview replaces official course instructions.

**Acceptance criteria:** Every published aid carries an AI-generated label, reviewed status/date, and source references; unreviewed outputs remain private; stale aids receive a visible warning or withdrawal based on severity; external links are tested using the intended visitor access; embeds have a normal-link fallback. An external NotebookLM quiz, audio player, or report does not silently report completion or scores to this platform. Source citations must not leak restricted filenames or links.

### F-10 — Administrative access and operating dashboard · P1 core

**Story:** As the maintainer, I see work needing attention and can trust that only authorized accounts can publish.

**Information:** intake awaiting review, conversion failures, broken links, stale module checks, generation queue, outdated aids, failed publications, and access issues. Each item links to its actionable record. Present a prioritized review-session summary suitable for one maintainer visiting a few times weekly. Automated discovery cadence may differ from human publication cadence; show both without promising immediate publication.

**Acceptance criteria:** Administrative endpoints enforce authentication and authorization on the server; changing client code or guessing a URL cannot grant write access; an unapproved signed-in account remains non-admin; role changes are recorded; missing/expired sessions preserve recoverable draft work where feasible. No Moodle password or token is placed in a public page, browser storage for visitors, or logs. Background activity has visible failures and a manual recovery route.

## 3. Phase 2: personal learning features

### F-11 — Student sign-in and privacy controls · P2 core

**Story:** As a student, I can opt into personal tools while retaining public access without an account.

**Fields:** internal user ID, authentication-provider subject, optional display name, preferred language, timezone, and privacy-choice timestamps. Email is stored only where needed for the chosen authentication or a separately accepted notification feature. Do not request student numbers, Google Drive access, or full Moodle credentials for ordinary sign-in.

**Acceptance criteria:** Cancelled sign-in returns to usable public content; redirect destinations are validated; students can access only their own private records; session expiry does not convert a personal action into a public write; sign-out is visible; account deletion explains scope, removes or anonymizes associated personal records according to the documented policy, and states any backup-retention delay. The policy must distinguish platform records from external Google/NotebookLM/Moodle accounts.

### F-12 — Bookmarks, progress, and dashboard · P2 core

**Story:** As a student, I can resume revision and record what I believe I have completed.

**Fields:** user ID, stable resource/activity ID, bookmark status, progress status, last changed time, and completion version where relevant. Proposed statuses: not started, in progress, completed; completion is self-reported unless a native activity supplies a verified result.

**Behavior:** Dashboard shows bookmarks, recently used modules, chosen revision priorities, and self-reported completion. Explain each progress denominator and avoid presenting it as academic performance. When a completed resource is substantially revised, retain the history and show “updated since you completed it” rather than erasing progress.

**Acceptance criteria:** Opening an external PDF never automatically means completed; changes persist across authorized devices; duplicate saves are safe; empty dashboards explain how to begin; one student's records are inaccessible to another; dates and versions remain interpretable after a resource rename or withdrawal. Automated recommendations and detailed behavioral analytics are later options.

### F-13 — Native practice quizzes and flashcards · P2 proposed

**Story:** As a student, I can practice with reviewed questions and receive understandable feedback.

**Fields:** activity/version ID, module/topic, language, source version IDs, question type, prompt, choices where applicable, accepted answer/rubric, explanation, reviewer, and publication status. Keep practice material distinct from official assessed tasks. Import or transcription from NotebookLM is subject to supported export formats and review, not an assumed API.

**Acceptance criteria:** Only reviewed question versions can appear; every scored question has a verified key and explanation; deterministic scoring is tested using correct, incorrect, and unanswered examples; calculation questions define units, rounding, and accepted tolerance. Unreviewed AI judgment does not assign marks. Submitted practice results retain their question version; an erroneous key can be corrected with transparent handling of prior results. External NotebookLM activities remain ordinary links unless a supported integration actually provides results. Official examination answers, student submissions, and gradebook synchronization are outside scope.

## 4. Cross-cutting quality and delivery checks

### F-14 — Languages, mobile use, and accessibility · P1 foundation

Arabic RTL, French, and English need interface strings and content-language metadata separately. Changing interface language must not falsely translate a source document. Missing translated text may fall back to its original language with an explicit label.

**Proposed targets for agreement:** usable layouts from 320 CSS pixels upward; keyboard access and visible focus; WCAG 2.2 AA as the accessibility target; restrained page payloads with PDFs, video, and audio loaded only on demand. Performance budgets are to be set after measuring representative phones and connections.

**Acceptance criteria:** Arabic titles, French text, numbers, dates, and URLs display in the intended reading order; document language/direction and mixed-direction fragments are marked correctly; navigation, search, dialogs, and forms have meaningful accessible names; cover alt text is appropriate to its purpose; meaning does not depend on color alone; zoom does not hide primary actions; media does not autoplay. Test the home, module, search, and resource journeys on a narrow viewport, keyboard-only flow, and a screen reader sample. Missing third-party media captions are disclosed; provide a reviewed transcript or alternative when feasible without claiming the external player is fully accessible.

### F-15 — Reliability, measurement, and boundaries · P1 foundation

Proposed success measures are coverage of the eight modules, percentage of verified resource links, delay from discovery to approved publication, age of the last successful check, and usefulness feedback. Agree targets after an initial baseline. Student-level engagement analytics and notifications need separate scope/privacy decisions; they are not implied by public browsing.

**Acceptance criteria:** A temporary Drive, Moodle, or NotebookLM outage leaves the catalog and source descriptions understandable; failures distinguish “service unavailable” from “no content”; a maintainer can identify and retry failed work; metadata and reviewed publication records have a documented backup-and-restore check. Verify the app on the assigned HTTPS subdomain and verify recovery of its persistent data on the university-hosted environment. A Proxmox snapshot or files on the same physical server must not be treated as the only recoverable backup. Infrastructure and storage costs are visible to the owner against the eventual agreed budget. University server availability and capacity are to be measured; no external failover or uptime guarantee is implied.

**Explicit non-goals for the initial release:** Moodle replacement, official enrollment verification, submission collection, private grade import, learning surveillance, automatic extraction from unsupported interfaces, guaranteed NotebookLM embedding, automatic completion tracking across external services, public student profiles, social feeds, full offline course mirroring, and automatic translation of all course documents. Revisit any of these only through a dated scope decision.

## 5. Release gate and unresolved product decisions

The first release should pass an end-to-end walkthrough: anonymous visitor → module → featured notes → resource/source link → reviewed aid → update notice. The maintainer walkthrough is discovery → local file/conversion → review → Drive access check → publication → source revision → affected-aid review → correction or rollback. Test a duplicate, failed conversion, rejected permission decision, failed upload, withdrawn source, and inaccessible external aid.

Before implementation, settle the monthly budget ceiling for remaining services and backup needs, university deployment/access details, initial aid formats and languages, approved automated monitoring method/cadence, whether reviewed aids may remain visible when outdated, accessibility/performance targets, and the first milestone's measurable coverage. Maintain records for newly added content without reopening the user's permission confirmation for the current inventory. These decisions refine the draft without reopening the confirmed audience, public browsing model, phase order, university hosting location, sole-maintainer arrangement, or few-times-weekly review availability.
