# NotebookLM learning-aid workflow and specification

Status: proposed implementation specification, pending scope approval. Verified against official Google documentation on **2026-09-26**; account-level capability tests remain outstanding. This document uses the user's familiar name, NotebookLM. Google's current Help Center redirects to **Gemini Notebook**; the enterprise documentation uses Gemini Notebook Enterprise. These names do not establish feature parity between account types. [Google Help Center](https://support.google.com/gemininotebook/?hl=en)

## 1. Recommended operating model

Keep Google Drive as the published PDF library and the application catalog as the record of sources, versions, generated aids, reviews, and publication. Use NotebookLM as an editorial production tool. For the first release, automate preparation and queue management, while an administrator operates NotebookLM generation and approves outputs. Students can browse the portal without signing in; a linked provider can still require its own account or permissions.

Start with one working notebook per module and a small reviewed aid collection. Reuse existing notebooks after an inventory and permission check. As of 2026-09-29, `Master\Links\NotbookLM artifacts links.md` lists notebooks for three modules: Lean Startup, English, and Deep Learning applications. The other five modules have none recorded. According to `Master\Semester 1 Dashboard.md` (sources verified 2026-09-25), these notebooks hold 14, 8, and 10 sources respectively. All three contain audio and video overviews. Lean Startup and English also have an interactive study guide; Deep Learning also has a quiz and other study artifacts. None has been reviewed under this workflow, and sharing settings have not been tested. Do not regenerate every format for every lecture. A useful initial target is a source-grounded overview or study guide per module, followed by selected mind maps and audio for difficult topics. Native quizzes and student progress remain Phase 2.

All workflow choices below are project recommendations, not claims about Google features.

## 2. Verified capability matrix

| Capability | Official evidence and limitation | Portal delivery recommendation |
|---|---|---|
| Whole public notebook | Public notebook access requires Google sign-in. A public artifact link can be viewed without sign-in according to the general sharing page. [Notebook creation and sharing](https://support.google.com/gemininotebook/answer/16206563?hl=en) | Label account requirements per tested link. Keep approved downloads available where possible. |
| Access boundaries | A chat-focused view does not remove underlying access to notebook sources. Public sharing can be revoked, invalidating links. [Public notebooks](https://support.google.com/gemininotebook/answer/16322204?hl=en) | Never publish a notebook containing materials that cannot be shared with its audience. |
| Mind maps | Downloading and notebook sharing are documented; the mobile app currently lacks this feature. [Mind maps](https://support.google.com/gemininotebook/answer/16212283?hl=en) | Offer a downloaded visual with a text outline; link to the interactive notebook. Verify the actual export format. |
| Audio overviews | Download and link sharing are supported. Arabic and French output are listed; interactive audio is English-only and recipients cannot interact through the shared audio link. [Audio help](https://support.google.com/gemininotebook/answer/16212820?hl=en) | Downloaded audio or external link; describe language, duration, and scope. Do not promise interactive audio inside the portal. |
| Video overviews | Downloads and sharing are documented. Generation can exceed 30 minutes; available formats have different language constraints. [Video help](https://support.google.com/gemininotebook/answer/16454555?hl=en) | Use selectively; show duration, file size, and a text alternative before playback. |
| Document reports | Reports can be exported to Google Docs; modifications and sharing permissions do not synchronize back. [Notebook outputs](https://support.google.com/gemininotebook/answer/16206563?hl=en) | Review the exported document and save an approved PDF or accessible portal article with its own permissions. |
| Interactive reports | Learning overviews can contain Studio artifacts inside NotebookLM; creation is web-only. Some content requires age 18+. [Reports help](https://support.google.com/gemininotebook/answer/18323649?hl=en) | External report link initially. This documented internal embedding is not evidence of a website iframe contract. |
| Slide decks | PDF and PowerPoint downloads are documented. Sources are not considered during slide revisions. [Slide decks](https://support.google.com/gemininotebook/answer/16757456?hl=en) | Publish PDF by default; review factual edits against the original source again. |
| Flashcards | CSV download and study interaction are documented. [Flashcards and quizzes](https://support.google.com/gemininotebook/answer/16958963?hl=en) | Phase 2 may import reviewed CSV through a validated schema; preserve provenance per card set. |
| Quizzes | Interactive quizzes are documented; this help page does not document a quiz download API or export format. [Flashcards and quizzes](https://support.google.com/gemininotebook/answer/16958963?hl=en) | Link externally initially; later author or manually transfer approved questions to native quizzes. |
| Infographics | PNG download is supported. [Infographics](https://support.google.com/gemininotebook/answer/16758265?hl=en) | Optional enrichment, accompanied by text and checked Arabic labels. |
| Consumer automation and external embeds | No supported consumer API contract or general website embedding specification was verified in the reviewed official documentation. | Do not make either a release dependency. Use supported UI actions, links, and downloads; revisit when an official contract is available. |

The general sharing page and artifact-specific pages describe access differently: the latter still mention shared/full-notebook access. Treat anonymous access as **unverified for each concrete artifact** until tested in a signed-out browser and by an unrelated student account. Public sharing is also described as unavailable for Workspace Enterprise/Education accounts on artifact help pages. [Sharing overview](https://support.google.com/gemininotebook/answer/16206563?hl=en), [Audio sharing restrictions](https://support.google.com/gemininotebook/answer/16212820?hl=en)

## 3. Sources, synchronization, and provenance

Current Google documentation lists PDFs and Google Docs among supported inputs and says supported files imported from Drive auto-update every few minutes or when a notebook is opened, with manual synchronization available. It also states that loss of Drive access makes the source inaccessible. It does not separately establish identical behavior for every PDF and Docs scenario. Test both against the actual account before relying on this behavior. A locally uploaded PDF has no documented live connection to the local original. [Source import documentation](https://support.google.com/gemininotebook/answer/16215270?hl=en)

**Source synchronization does not establish that an already generated artifact has been regenerated.** The portal must compare source dependencies and explicitly mark affected aids for review.

For reproducibility, create an immutable local snapshot of the exact approved source set before generation. Prefer version-specific Drive source copies that will not be overwritten, or local uploads of those snapshots. Working notebooks may track current materials, but a published artifact always points to frozen versions. Do not change sharing settings of an existing notebook automatically.

Maintain the following records in the catalog:

| Record | Required fields |
|---|---|
| Source version | Resource ID, version ID, module, original Moodle URL, Drive file ID if present, local snapshot path, SHA-256, original filename/type, conversion record, discovered/published dates, language, rights status, supersedes ID |
| Notebook source mapping | Notebook URL/ID, source label or source ID where observable, import method, source-version ID, imported/verified time, active/inaccessible status |
| Generation request | Request ID, selected version IDs, scope (`module`, `topic`, `single_source`), format, language, template version, exact prompt, priority, requestor, state, quota note |
| Artifact version | Artifact ID/version, request ID, actual source snapshot, output filename/hash or share URL, generation time, editor/reviewer, review findings, publication/freshness state, replaced artifact ID |

Do not fabricate source IDs that the interface does not expose. A notebook URL plus an audited source-label/version mapping is acceptable for the manual workflow. Keep original DOC/DOCX privately in intake if needed, but convert them to PDF before final course-library publication, matching the existing preference.

## 4. Incremental queue and prioritization

Use three distinct dimensions rather than one overloaded status:

- **Job:** `proposed → ready → generating → generated → in_review → approved → published`; branches: `blocked`, `quota_wait`, `failed`, `cancelled`.
- **Review:** `unreviewed`, `changes_required`, `reviewed`; never label an unreviewed aid as validated.
- **Freshness:** `current`, `review_needed`, `outdated`, `withdrawn`. A published aid can be reviewed yet outdated after its source changes.

A failed attempt retains its history and reason. Retry only transient failures, with an explicit attempt limit and operator action after repeated failure. A source change while generation is running invalidates “current” status until the exact input set is reconciled. Replaced jobs must not publish over a newer version.

Suggested priorities:

| Priority | Trigger | Action |
|---|---|---|
| P0 | Incorrect published aid, withdrawn permission, harmful source mismatch | Hide or flag immediately; review before spending quota on replacement |
| P1 | Missing short study aid for newly published teaching material or upcoming revision | Prefer concise guide, flashcards, or a topic outline |
| P2 | Material source correction or topic expansion | Regenerate only dependent aids after assessing relevance |
| P3 | Module-wide consolidation | Batch after a meaningful group of lectures changes |
| P4 | Additional language, long video, stylistic variant | Generate when usefulness and quota justify it |

Within a priority, consider topic demand, exam proximity, age of request, coverage gaps, and reviewer capacity. A new assessment should first publish its verified official instructions and Moodle link; generation must not delay it or produce speculative answers to active graded work.

Google's current limit guide describes compute-based usage from September 2, 2026, with five-hour refreshes subject to a weekly cap; it also documents a web “Generate later” option. Some individual help pages retain older daily tables. Use the signed-in Usage panel as the operational check, and record the account plan, remaining allowance, and next reset instead of hardcoding daily generation counts. [Current usage limits](https://support.google.com/gemininotebook/answer/17670842?hl=en)

Do not create automatic provider retries from a guessed reset time. Queue scheduling is local; NotebookLM submission remains manual initially. If the operator uses “Generate later,” record that submission so another operator cannot duplicate it.

## 5. Administrator production runbook

1. **Review intake.** Confirm the Moodle resource, module, permission, completeness, readable PDF conversion, and intended audience. Reject duplicates using byte hash plus source identity; a renamed file alone is not new teaching content.
2. **Prepare inputs.** Approve the version, snapshot the selected sources, assign a scope, and create a reproducible prompt. Include only the relevant inputs; distinguish official material from editorial notes.
3. **Check the notebook.** Verify source selection, visible content, language, import success, and version mapping. For a module overview, label its coverage date and included lectures rather than claiming complete semester coverage.
4. **Submit manually.** Choose the available format and language, capture the exact prompt, and mark the request generating. A suggested template is: “Create a [format] for UFC Master 1 accounting students, using only [selected sources]. Explain [topic] in [language], preserve accounting terminology, identify uncertainty, and do not invent deadlines or official assessment requirements.”
5. **Collect.** Download through supported controls or copy the official share link. Record actual MIME type, size, duration/page count, output hash, and generation time. Never rename a file extension to simulate conversion.
6. **Review.** Check definitions, accounting standards, formulas, examples, numerical results, source coverage, and language. Check Arabic shaping, RTL order, French terminology, charts, audio pronunciation, and citations. Listen to audio and watch video before labeling the whole artifact reviewed.
7. **Publish.** Save locally first; then upload approved exports to the appropriate Drive location and add catalog metadata. Test the intended audience's access. Expose title, type, language, scope, source links, review date, and freshness on the module page.
8. **Maintain.** On approved source changes, query dependent artifacts, mark review needed, and prioritize replacements. Do not automatically delete older evidence; suppress withdrawn content from students while retaining a restricted audit record where appropriate.

A format without supported export can still be offered through a tested external link. If that link is inaccessible, publish a reviewed static summary or keep the aid unavailable with a clear reason. Do not promise an interactive experience that an exported image or PDF cannot preserve.

## 6. Enterprise automation decision

Google documents preview enterprise APIs for notebook management, source management, and audio-overview generation. Enterprise setup and licensing are required for notebook APIs. The audio API documentation currently permits one audio overview per notebook. This is a separate integration and does not prove API access to existing consumer notebooks or every Studio format. [Notebook API](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks), [Source API](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources), [Audio API](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-audio-overview)

Defer this option until the manual pilot measures a genuine bottleneck. A future evaluation must price licensing, test public/student access, confirm regional availability, prove the required formats, and establish a supported migration or fresh-import path. Do not adopt unofficial cookie-based clients or private endpoints as the platform's production dependency.

## 7. Acceptance tests and first pilot

| Test | Pass condition |
|---|---|
| Permissions | A signed-out visitor and unrelated student can access every aid advertised for them; restricted resources remain restricted |
| Input fidelity | An Arabic PDF and a Google Doc are imported and compared with their originals; any sync differences are recorded |
| Source update | Replacing a test source marks dependent aids only; unrelated aids remain current; existing output is not silently claimed regenerated |
| Provenance | Every published aid resolves to exact source versions, prompt, reviewer, and output version |
| Quota exhaustion | The job waits without duplicate generation; official-resource publication continues |
| Failed or stale job | Retry/review cannot overwrite a newer published artifact |
| Output quality | No unresolved factual or numerical errors; readable RTL text; media reviewed end to end; accessible alternative present |
| Revocation | Removing a link or permission produces a useful fallback and alerts the administrator |
| Progress boundary | External NotebookLM usage is not presented as verified portal completion or quiz scores |

Run the pilot on the two M0 modules from the [development plan](development-plan.md), Lean Startup (Arabic) and English, both of which already have notebooks, using one report, one mind map, and one audio artifact overall before expanding. Record actual generation effort, review time, available exports, access behavior, and quota consumption. Approval of that evidence is the gate to broader production; the portal's core PDF library must remain usable if NotebookLM is unavailable.
