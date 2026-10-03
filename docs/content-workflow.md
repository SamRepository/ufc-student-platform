# Content acquisition, review, and publication workflow

Status: proposed implementation specification, incorporating the user's confirmed operating decisions on **26 September 2026**. Official documentation checked on the same date. The UFC Moodle site's integration settings and current file permissions were **not inspected** for this document.

## 1. Responsibilities and sources of truth

Moodle is authoritative for official teaching content, assessment instructions, and deadlines. The local library holds reviewed files and conversion evidence. Drive stores the approved PDF copies used by the portal. The application database holds catalog metadata, publication state, provenance, and audit history. NotebookLM outputs are derivative study aids with their own source-version and review records.

Confirmed owner: Samir is the sole content administrator and will maintain the collection a few times per week. He confirms permission to share all currently intended materials; record that confirmation in the catalog's rights basis without repeatedly treating the same materials as unresolved. This does not imply institutional endorsement by UFC or ENSET-Skikda, and genuinely new materials outside the confirmed scope still need a rights classification. The administrator approves publication, access changes, assessment corrections, and retirements. Public browsing is supported; the intended audience and actual Drive access must agree.

Keep the existing eight module folders, edited Markdown notes, course-cover images, and `00- 00 Moodle Notes.pdf` ordering. Do not reorganize or overwrite these during implementation without a reviewed migration manifest.

## 2. Integration capability and fallback

| Integration | Verified generic capability | Unverified project condition | Working fallback |
| --- | --- | --- | --- |
| Moodle web services | A site administrator enables web services, protocols, service functions, user capabilities, and authorized tokens. | Whether UFC enables a suitable service, permits this use, and exposes required functions for this account. | Administrator checks course pages through their normal signed-in browser and enters/downloads changes. |
| Moodle calendar | Moodle supports downloaded ICS files and subscription URLs; results depend on the user and export selection. | Whether this portal exposes export; which events and group-specific dates are included. | Enter dates from the activity page and record verification evidence. |
| Drive API | File metadata, permissions, uploads, and changes can be managed under suitable authorization. | Account type, current ACLs, app authorization, existing-file access, quota, and ownership setup. | Upload approved PDFs through Drive and paste tested links into the catalog. |

The Moodle service setup is an administrator-controlled capability, not something supplied automatically by an existing browser login. Select only read operations from the site's actual API documentation; do not assume every Moodle installation exposes the same service functions. Keep tokens server-side or in the local operating-system credential store, redact them from logs, and use expiry/revocation where available. [Moodle: Using web services](https://docs.moodle.org/501/en/Using_web_services)

A calendar subscription URL can contain an access token. Store it as a secret and never publish the feed itself. Import only approved course events; exclude personal and group-specific records from a general student portal. Calendar feeds supplement activity review and cannot prove that all assignments were discovered. A downloaded ICS file is a snapshot, while a subscription may update with delay. [Moodle: Using Calendar](https://docs.moodle.org/502/en/Using_Calendar)

Do not build unattended scraping against the signed-in browser as the default integration. First ship the manual review and import path; enable authorized API discovery only after a small capability test succeeds. No workflow submits work, marks Moodle activities complete, changes subscriptions, or collects private grades.

## 3. Local-first acquisition

The proposed Windows ingestion worker runs when the administrator starts it or when a configured scheduled task finds the machine awake and connected. A missed run remains visible. A cloud scheduler cannot complete local conversion while that machine is off.

1. **Discover:** capture course/module ID, Moodle activity ID, canonical URL, visible title, resource type, discovery time, source-modified time if available, and acquisition method. For pages, preserve only the approved useful content; for assessments, record instructions separately from student work.
2. **Stage:** download an authorized file into a private incoming job directory, outside public Drive folders. Validate that the response is a real expected file rather than a login/error HTML page. Record MIME type, byte size, original filename, and SHA-256.
3. **Normalize:** PDFs proceed to validation. DOC/DOCX files are temporary conversion inputs; convert them locally to PDF before admission to the final course library. Never rename the extension as a conversion. Record converter/version, input hash, output hash, and conversion result.
4. **Check:** verify that the PDF opens, has plausible pages, and retains Arabic shaping, tables, diagrams, equations, headings, and readable text. Review rendered pages for every converted document; compare ambiguous or missing content with the original. A failed conversion stays unpublished.
5. **Review:** show the old/new title, source details, document preview, duplicate warning, proposed module, rights basis, audience, and changed pages/metadata. Require an explicit administrator decision.
6. **Save:** place the approved PDF in the matching module folder, preserving existing approved revisions in a private version archive. Keep source DOC/DOCX only in private staging if retention is agreed; it is never a final student resource.
7. **Publish:** upload or update the mapped Drive object, verify the intended viewer can open it, then commit the catalog revision and public update entry. Queue affected study aids after this commit.

Recommended generated filenames use a stable lesson order and descriptive title. Identity comes from the manifest and hashes, never the filename alone. Treat changes to user-edited notes as an explicit content revision and regenerate their PDF with visual checks.

## 4. Versioning and idempotency

Use a logical `resource_id` for the enduring resource and an immutable `resource_revision_id` for each accepted revision, matching the `resource_revisions` table in [architecture.md](architecture.md). Preserve:

| Record | Required fields |
| --- | --- |
| Source identity | Moodle base URL, course ID, activity ID, source URL; subfile path/key when an activity contains several files |
| Revision evidence | Original SHA-256, published-PDF SHA-256, source-modified timestamp, discovered timestamp, conversion recipe/version |
| Publication | Local path, Drive file ID, approved viewer URL, catalog version, audience, approval actor/time, rights status |
| Processing | Job ID, step, attempts, error category, last success, next retry, audit events |

Use unique keys for `(source identity, original hash, conversion recipe)` and `(resource version, publication target)`. A retried job resumes its unfinished step instead of creating another Drive file or update announcement. Store the Drive ID immediately after upload; if the response is lost, reconcile the stored job marker/hash before another upload. Commit the public catalog only after the file verification step succeeds.

The same bytes under two Moodle links can share an underlying asset while retaining both source records. Renames create metadata changes, not automatic new lessons. A changed source hash creates a proposed revision; changing only the PDF converter does not imply new official teaching content. Keep a separate normalized text hash as a review aid, not proof that diagrams or layout stayed equivalent.

Store each study aid's exact source-version set. Source changes mark only dependent aids `review_needed`; unrelated aids remain current. Reviewers decide whether to regenerate, annotate an unaffected aid, or retire it. Use the canonical freshness states in [notebooklm-workflow.md](notebooklm-workflow.md). The workflow does not promise unattended NotebookLM generation.

## 5. Drive access and delivery

Separate student identity from administrator Drive authorization. Students must not grant access to their personal Drives merely to browse or track learning. For the admin integration, test the narrow `drive.file` scope with explicitly selected or app-created files. It grants per-file access; do not treat selecting a folder as a blanket authorization to every existing and future descendant. Broad `drive.readonly`, `drive.metadata.readonly`, and `drive` scopes are restricted scopes and can add verification/security-assessment obligations. Resolve this choice in the integration pilot before committing to automatic existing-library synchronization. [Google: Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)

Drive enforces its own permissions independently of a portal login. An `anyone` reader grant makes the corresponding link audience broader than authenticated portal students; a restricted file may require a separately authorized Google account. Folder permissions can propagate to children, and moving files can change effective access. Inspect the intended file and parent sharing before publishing. Never change the semester folder to public as a convenience workaround. Limit sharing, sync, and any import to `Master\2027-2026 Master S1` (or a dedicated publication folder), never the parent `Master\` folder. That parent also holds personal enrollment documents (`Inscription 2026-2027`, `UFCM1`) that must never be shared, uploaded, or committed. A shared Drive link is not evidence of redistribution rights. [Google: Share files, folders, and drives](https://developers.google.com/workspace/drive/api/guides/manage-sharing)

Start with an **Open PDF in Drive** link. Offer an inline viewer only after testing the actual file and account conditions in desktop Chrome and iPhone Safari, with a visible open-in-new-tab fallback. Do not require a successful iframe for access. Record provider-returned `webViewLink`, and use `webContentLink` only where download is permitted and available; these fields describe different actions. [Google: File resource](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)

Do not design Drive as an unlimited CDN or cache protected file bytes publicly. Keep portal metadata and covers lightweight; fetch catalog data from the application database rather than scanning Drive per student visit. For Google Workspace-native documents, API export has a 10 MB exported-content limit; the project normally publishes locally generated binary PDFs, which use a different download path. [Google: Download and export files](https://developers.google.com/workspace/drive/api/guides/manage-downloads)

Google's quota documentation changed in May 2026 and distinguishes project cohorts; it also announces planned charges for excessive usage later in 2026. Read the actual Cloud project's quotas and current billing conditions before launch. Use bounded exponential backoff for rate limits, request only needed fields, and monitor errors/usage. Do not hard-code a historical requests-per-minute assumption or promise permanently free unlimited traffic. [Google: Usage limits](https://developers.google.com/workspace/drive/api/guides/limits)

## 6. Changes, removals, and assessment dates

After an authorized Drive baseline import, a worker can persist a changes cursor and process every page before advancing the checkpoint. A removed entry can indicate deletion **or loss of access**. It must not trigger deletion of the local archive automatically. Schedule a periodic full reconciliation in addition to incremental processing, bounded to the approved collection. [Google: Retrieve changes](https://developers.google.com/workspace/drive/api/guides/manage-changes), [changes.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/changes/list)

Proposed handling rules:

- **Moodle no longer shows a resource:** distinguish incomplete scan, expired login, access restriction, and verified removal. Mark `source_unavailable` with evidence; do not announce deletion from one failed check.
- **Rights/access revoked:** suspend portal delivery and dependent public aids immediately, then review archive retention and removal. Purge public catalog/cache entries; do not continue serving a cached copy to defeat the restriction.
- **Ordinary replacement:** keep the last approved version visible with its date while a replacement is reviewed, unless it is misleading or withdrawn. Publish an explicit replacement notice and preserve the audit record.
- **Missing deadline:** display “Deadline not confirmed,” never infer midnight or an unlimited submission window.
- **Dates:** separately store opening, due, cut-off, quiz close, and availability dates where supplied. Preserve original text, source timezone, UTC instant when unambiguous, audience, and last verification time. Use `Africa/Algiers` as the proposed course display zone and confirm the Moodle interpretation; optionally show the student's local time alongside it.
- **Personal extensions/group overrides:** never present one student's special date as the cohort deadline. Link to the official activity for the student's applicable instructions and submission.

An assessment date change produces an administrator review item with old and new values. Public notices show the correction and verification time. Reminders are a later opt-in feature and must be cancelled/rescheduled when approved dates change.

## 7. Operational targets and acceptance

Confirmed cadence: the sole maintainer reviews and updates the collection a few times per week; specific days remain flexible, with attention around announced assessment periods. Start authorized discovery on the same cadence; daily remote checks can be an optional later setting. Local downloads/conversion wait for the Windows worker and approval still controls publication. Display `last_source_check_at`, `last_successful_import_at`, and `last_published_at` separately. A recommended target is publication within 24 hours after an administrator completes review, not a guarantee measured from an unknown Moodle posting time. Once the administrator actually presses Publish and the operation succeeds, the public projection should update within the five-minute target in [validation-and-operations.md](validation-and-operations.md). The hosting design is in [deployment-specification.md](deployment-specification.md).

Retry transient network/rate-limit errors with jitter, capped attempts, and a resumable queue. Expired credentials, denied permissions, conversion failures, and ambiguous dates require attention rather than endless retries. Keep the last valid public catalog during infrastructure failure; display freshness without presenting a failed scan as “no updates.” Back up the database, manifests, approved PDFs, and version archives; keep backups separate from the live Drive copy and periodically test restore. Never store secrets in those ordinary manifests.

Release acceptance:

1. Importing the same item twice creates one published revision and one announcement.
2. A DOCX with Arabic and tables becomes a reviewed PDF; a broken conversion cannot publish.
3. An upload interrupted before catalog commit resumes without duplicate files.
4. An authorized guest can open every public PDF; restricted files remain restricted.
5. A source correction flags its dependent aid without regenerating unrelated material.
6. An expired login or partial scan does not retire existing resources.
7. A withdrawn permission suspends delivery and removes public cache entries.
8. Deadline display survives timezone conversion and preserves an unknown date as unknown.
9. The manual browser/download/upload/catalog route completes without Moodle API access.
10. Turning the Windows machine off produces a visible missed run; restoring a backup recovers a usable reviewed catalog.
