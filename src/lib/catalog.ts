/**
 * Public projection of the catalog (architecture.md §2): pages and the search index read only
 * from here, never from the raw manifest. Drafts appear only when SHOW_DRAFTS=1 (local preview).
 */
import { loadCatalog, type Catalog, type CatalogModule } from './load-catalog';
import { checkRules } from './rules';
import type { Aid, LocalizedText, Locale, Resource, Update } from './schema';

export interface ViewOptions {
  includeDrafts: boolean;
}

export function viewOptionsFromEnv(env: Record<string, string | undefined> = process.env): ViewOptions {
  return { includeDrafts: env.SHOW_DRAFTS === '1' };
}

export const driveViewUrl = (fileId: string) => `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;

export function currentRevision(r: Resource) {
  return r.revisions.find((rev) => rev.id === r.current_revision);
}

export function isPublicResource(r: Resource): boolean {
  return r.status === 'published' && r.rights === 'approved_public' && Boolean(currentRevision(r)?.drive_file_id);
}

export function isPublicAid(a: Aid): boolean {
  return (
    a.status === 'published' &&
    a.review_status === 'approved' &&
    Boolean(a.reviewed) &&
    Boolean(a.delivery === 'external_link' ? a.url : a.drive_file_id)
  );
}

export interface PublicResource {
  id: string;
  moduleId: string;
  type: Resource['type'];
  order: number;
  origin: Resource['origin'];
  language: Resource['language'];
  featured: boolean;
  title: LocalizedText;
  topic?: string;
  tags: string[];
  summary?: Resource['summary'];
  officialUrl?: string;
  reviewed?: string;
  isDraft: boolean;
  revision: {
    id: string;
    pages?: number;
    bytes: number;
    acquired: string;
    publishedOnMoodle?: string;
    academicYear?: string;
    fileUrl?: string;
    count: number;
  };
}

export interface PublicAid {
  id: string;
  format: Aid['format'];
  language: Aid['language'];
  scope: Aid['scope'];
  title: LocalizedText;
  sourceResourceIds: string[];
  generated: string;
  reviewed?: string;
  outdated: boolean;
  url?: string;
  isDraft: boolean;
}

export interface PublicModule {
  id: string;
  title: LocalizedText;
  language: CatalogModule['language'];
  cover?: string;
  moodle: CatalogModule['moodle'];
  overview?: CatalogModule['overview'];
  facts?: CatalogModule['facts'];
  resources: PublicResource[];
  aids: PublicAid[];
}

export interface PublicCatalog {
  semester: Catalog['semester'];
  modules: PublicModule[];
  updates: Update[];
  includeDrafts: boolean;
}

function projectResource(moduleId: string, r: Resource): PublicResource {
  const rev = currentRevision(r)!;
  return {
    id: r.id,
    moduleId,
    type: r.type,
    order: r.order,
    origin: r.origin,
    language: r.language,
    featured: r.featured,
    title: r.title,
    topic: r.topic,
    tags: r.tags,
    summary: r.summary,
    officialUrl: r.official_url,
    reviewed: r.reviewed,
    isDraft: !isPublicResource(r),
    revision: {
      id: rev.id,
      pages: rev.pages,
      bytes: rev.bytes,
      acquired: rev.acquired,
      publishedOnMoodle: rev.published_on_moodle,
      academicYear: rev.academic_year_label,
      fileUrl: rev.drive_file_id ? driveViewUrl(rev.drive_file_id) : undefined,
      count: r.revisions.length,
    },
  };
}

/** Featured first (notes), then explicit order. Never depends on filename sorting (F-02). */
export function sortResources(list: PublicResource[]): PublicResource[] {
  return [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || a.id.localeCompare(b.id));
}

export function project(catalog: Catalog, options: ViewOptions): PublicCatalog {
  const revisionToResource = new Map<string, string>();
  for (const m of catalog.modules) for (const r of m.resources) for (const rev of r.revisions) revisionToResource.set(rev.id, r.id);

  const modules = catalog.modules.map((m): PublicModule => {
    const resources = m.resources
      .filter((r) => r.status !== 'withdrawn' && (isPublicResource(r) || options.includeDrafts))
      .map((r) => projectResource(m.id, r));
    const visibleIds = new Set(resources.map((r) => r.id));
    const aids = m.aids
      .filter((a) => isPublicAid(a) || (options.includeDrafts && a.status !== 'withdrawn' && a.review_status !== 'rejected'))
      .map((a): PublicAid => ({
        id: a.id,
        format: a.format,
        language: a.language,
        scope: a.scope,
        title: a.title,
        sourceResourceIds: [...new Set(a.source_revisions.map((id) => revisionToResource.get(id)!))].filter((id) => visibleIds.has(id)),
        generated: a.generated,
        reviewed: a.reviewed,
        outdated: a.freshness === 'outdated',
        url: a.delivery === 'external_link' ? a.url : a.drive_file_id && driveViewUrl(a.drive_file_id),
        isDraft: !isPublicAid(a),
      }));
    return {
      id: m.id,
      title: m.title,
      language: m.language,
      cover: m.cover,
      moodle: m.moodle,
      overview: m.overview,
      facts: m.facts,
      resources: sortResources(resources),
      aids,
    };
  });

  const updates = catalog.updates
    .filter((u) => (u.status === 'published' && u.reviewed) || options.includeDrafts)
    .sort((a, b) => b.discovered.localeCompare(a.discovered));

  return { semester: catalog.semester, modules, updates, includeDrafts: options.includeDrafts };
}

let cached: PublicCatalog | undefined;

/** Loads, validates (schema + rules) and projects the catalog once per build. */
export function getPublicCatalog(): PublicCatalog {
  if (cached) return cached;
  const catalog = loadCatalog();
  const problems = checkRules(catalog);
  if (problems.length) throw new Error(`Catalog rule violations:\n  - ${problems.join('\n  - ')}`);
  cached = project(catalog, viewOptionsFromEnv());
  return cached;
}

/** Picks the display text for a locale; falls back to the original and says so. */
export function pickTitle(text: LocalizedText, locale: Locale, originalLang: string) {
  const translated = text[locale];
  if (translated) return { value: translated, lang: locale, fallback: false };
  return { value: text.original, lang: originalLang === 'mixed' ? undefined : originalLang, fallback: originalLang !== locale };
}

/** Curator text: prefer the UI locale, then ar → fr → en. */
export function pickCurator(text: Partial<Record<Locale, string>>, locale: Locale) {
  if (text[locale]) return { value: text[locale]!, lang: locale, fallback: false };
  for (const l of ['ar', 'fr', 'en'] as const) if (text[l]) return { value: text[l]!, lang: l, fallback: true };
  return undefined;
}
