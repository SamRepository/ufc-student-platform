/**
 * Catalog schema — the single source of truth for the YAML manifest in ./catalog.
 * Used by the Astro build, scripts/validate-catalog.ts and the tests.
 *
 * Terminology follows docs/architecture.md §4: a "revision" is an immutable accepted
 * copy of a resource file. Local file paths are never stored here.
 */
import { z } from 'zod';

export const LOCALES = ['ar', 'fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const isoDate = z.iso.date(); // YYYY-MM-DD; dates stay strings so YAML parsing never shifts timezones

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase-kebab-case id');

/** Original text is kept verbatim; translations are optional display aids. */
export const textSchema = z
  .object({
    original: z.string().min(1),
    ar: z.string().min(1).optional(),
    fr: z.string().min(1).optional(),
    en: z.string().min(1).optional(),
  })
  .strict();
export type LocalizedText = z.infer<typeof textSchema>;

/** Curator-written text (not course content) — may be written directly per locale. */
const curatorTextSchema = z
  .object({ ar: z.string().optional(), fr: z.string().optional(), en: z.string().optional() })
  .strict()
  .refine((t) => t.ar || t.fr || t.en, 'at least one locale is required');

const httpsUrl = z.url({ protocol: /^https$/ });

export const ORIGINS = ['official', 'student_note', 'ai_aid'] as const;
export const RESOURCE_TYPES = ['notes', 'syllabus', 'lecture', 'exercise', 'assessment', 'reference'] as const;
export const STATUSES = ['draft', 'reviewed', 'ready', 'published', 'withdrawn'] as const;
export const RIGHTS = ['unknown', 'link_only', 'approved_public', 'restricted', 'withdrawn'] as const;
export const CONTENT_LANGUAGES = ['ar', 'fr', 'en', 'mixed'] as const;

export const DRIVE_FILE_ID = /^[A-Za-z0-9_-]{20,}$/;

export const revisionSchema = z
  .object({
    id: slug,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    bytes: z.number().int().positive(),
    pages: z.number().int().positive().optional(),
    /** Filename as acquired (no directory). Kept for provenance; shown only on the resource page. */
    source_filename: z.string().min(1),
    /** Date the file was acquired into the local library — not an official publication date. */
    acquired: isoDate,
    published_on_moodle: isoDate.optional(),
    academic_year_label: z.string().optional(),
    drive_file_id: z.string().regex(DRIVE_FILE_ID).optional(),
    notes: z.string().optional(),
  })
  .strict();
export type Revision = z.infer<typeof revisionSchema>;

export const resourceSchema = z
  .object({
    id: slug,
    type: z.enum(RESOURCE_TYPES),
    order: z.number().int().min(0),
    origin: z.enum(ORIGINS),
    language: z.enum(CONTENT_LANGUAGES),
    featured: z.boolean().default(false),
    title: textSchema,
    topic: z.string().optional(),
    tags: z.array(z.string()).default([]),
    summary: curatorTextSchema.optional(),
    rights: z.enum(RIGHTS),
    /** Reference to the evidence for the rights decision (never the evidence itself). */
    rights_basis: z.string().optional(),
    status: z.enum(STATUSES),
    reviewed: isoDate.optional(),
    official_url: httpsUrl.optional(),
    current_revision: slug,
    revisions: z.array(revisionSchema).min(1),
    withdrawal_reason: z.string().optional(),
  })
  .strict();
export type Resource = z.infer<typeof resourceSchema>;

export const AID_FORMATS = [
  'audio_overview',
  'video_overview',
  'mind_map',
  'report',
  'study_guide',
  'briefing',
  'slides',
  'quiz',
  'flashcards',
] as const;

export const aidSchema = z
  .object({
    id: slug,
    format: z.enum(AID_FORMATS),
    language: z.enum(CONTENT_LANGUAGES),
    scope: z.enum(['module', 'topic', 'source']),
    title: textSchema,
    /** Exact resource revision IDs the aid was generated from. */
    source_revisions: z.array(slug).min(1),
    generated: isoDate,
    review_status: z.enum(['unreviewed', 'approved', 'rejected']),
    reviewed: isoDate.optional(),
    freshness: z.enum(['current', 'outdated']).default('current'),
    delivery: z.enum(['external_link', 'drive_export']),
    url: httpsUrl.optional(),
    drive_file_id: z.string().regex(DRIVE_FILE_ID).optional(),
    status: z.enum(STATUSES),
  })
  .strict();
export type Aid = z.infer<typeof aidSchema>;

export const moduleSchema = z
  .object({
    id: slug,
    /** Prefix used by scripts/draft_manifest.py when proposing resource IDs. */
    id_prefix: slug,
    title: textSchema,
    language: z.enum(CONTENT_LANGUAGES),
    /** Filename inside catalog/covers/. */
    cover: z.string().regex(/^[a-z0-9-]+\.(png|jpe?g|webp)$/).optional(),
    moodle: z
      .object({
        course_id: z.number().int().positive(),
        url: httpsUrl,
        last_checked: isoDate.optional(),
      })
      .strict(),
    overview: z
      .object({
        text: curatorTextSchema,
        checked: isoDate,
      })
      .strict()
      .optional(),
    /** Only facts verified on the official course page. */
    facts: z
      .object({
        instructor: z.string().optional(),
        credits: z.number().optional(),
        coefficient: z.number().optional(),
        academic_year: z.string().optional(),
        verified: isoDate,
      })
      .strict()
      .optional(),
    aids: z.array(aidSchema).default([]),
  })
  .strict();
export type ModuleData = z.infer<typeof moduleSchema>;

export const UPDATE_CATEGORIES = ['new', 'revised', 'removed', 'corrected', 'assessment'] as const;

export const updateSchema = z
  .object({
    id: slug,
    module: slug,
    category: z.enum(UPDATE_CATEGORIES),
    title: curatorTextSchema,
    summary: curatorTextSchema.optional(),
    source_url: httpsUrl.optional(),
    published_on_moodle: isoDate.optional(),
    discovered: isoDate,
    reviewed: isoDate.optional(),
    resource_ids: z.array(slug).default([]),
    status: z.enum(STATUSES),
  })
  .strict();
export type Update = z.infer<typeof updateSchema>;

export const semesterSchema = z
  .object({
    id: slug,
    title: curatorTextSchema,
    academic_year: z.string().optional(),
    portal_url: httpsUrl,
    /** Display order of module ids (follows the Moodle portal). */
    modules: z.array(slug).min(1),
  })
  .strict();
export type Semester = z.infer<typeof semesterSchema>;

export const resourcesFileSchema = z.array(resourceSchema);
export const updatesFileSchema = z.array(updateSchema);
