import type { Catalog } from '../src/lib/load-catalog';
import type { Resource } from '../src/lib/schema';

let n = 0;
/** A distinct fake SHA-256 per call. */
const fakeSha = () => (++n).toString(16).padStart(64, '0');

export function resource(id: string, over: Partial<Resource> = {}, revOver: Partial<Resource['revisions'][number]> = {}): Resource {
  return {
    id,
    type: 'lecture',
    order: 1,
    origin: 'official',
    language: 'ar',
    featured: false,
    title: { original: `Title ${id}` },
    tags: [],
    rights: 'approved_public',
    status: 'published',
    reviewed: '2026-10-01',
    current_revision: `${id}-r1`,
    revisions: [
      {
        id: `${id}-r1`,
        sha256: fakeSha(),
        bytes: 1000,
        source_filename: `${id}.pdf`,
        acquired: '2026-09-26',
        drive_file_id: 'A'.repeat(25),
        ...revOver,
      },
    ],
    ...over,
  };
}

export function catalog(resources: Resource[], extra: Partial<Catalog> = {}): Catalog {
  return {
    semester: { id: 's1', title: { en: 'S1' }, portal_url: 'https://mast-cmpt.ufc.dz/s1/', modules: ['mod'] },
    modules: [
      {
        id: 'mod',
        id_prefix: 'm',
        title: { original: 'Module' },
        language: 'ar',
        moodle: { course_id: 1, url: 'https://mast-cmpt.ufc.dz/s1/course/view.php?id=1' },
        aids: [],
        resources,
      },
    ],
    updates: [],
    ...extra,
  };
}
