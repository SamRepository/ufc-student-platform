/**
 * Search index (F-04): built at build time from the public projection only, searched in the
 * browser. Holds titles, topics, tags, reviewed summaries and module titles — never PDF text.
 */
import type { PublicCatalog } from './catalog';
import { normalize, tokens } from './normalize';
import type { LocalizedText } from './schema';

export interface IndexEntry {
  id: string;
  module: string;
  type: string;
  origin: string;
  language: string;
  title: LocalizedText;
  draft?: true;
  /** Normalized title variants (original + translations). */
  nt: string;
  /** Normalized secondary text: module title, topic, tags, summary. */
  nh: string;
  /** Position for stable ordering: module order, then featured/order. */
  pos: number;
}

export interface SearchIndex {
  modules: { id: string; title: LocalizedText; language: string }[];
  entries: IndexEntry[];
}

const allText = (t: Partial<Record<string, string>>) => Object.values(t).filter(Boolean).join(' ');

export function buildIndex(catalog: PublicCatalog): SearchIndex {
  const entries: IndexEntry[] = [];
  catalog.modules.forEach((m, mi) => {
    m.resources.forEach((r, ri) => {
      entries.push({
        id: r.id,
        module: m.id,
        type: r.type,
        origin: r.origin,
        language: r.language,
        title: r.title,
        ...(r.isDraft ? { draft: true as const } : {}),
        nt: normalize(allText(r.title)),
        nh: normalize([allText(m.title), r.topic ?? '', r.tags.join(' '), r.summary ? allText(r.summary) : ''].join(' ')),
        pos: mi * 1000 + ri,
      });
    });
  });
  return { modules: catalog.modules.map((m) => ({ id: m.id, title: m.title, language: m.language })), entries };
}

export interface Filters {
  module?: string;
  type?: string;
  language?: string;
  origin?: string;
}

/** Every query token must match somewhere; exact and title matches rank first. */
export function search(index: SearchIndex, query: string, filters: Filters = {}): IndexEntry[] {
  const q = normalize(query);
  const qt = tokens(query);
  const scored: [number, IndexEntry][] = [];
  for (const e of index.entries) {
    if (filters.module && e.module !== filters.module) continue;
    if (filters.type && e.type !== filters.type) continue;
    if (filters.language && e.language !== filters.language) continue;
    if (filters.origin && e.origin !== filters.origin) continue;
    if (qt.length === 0) {
      scored.push([0, e]);
      continue;
    }
    const all = `${e.nt} ${e.nh}`;
    if (!qt.every((tok) => all.includes(tok))) continue;
    const score = e.nt === q ? 100 : e.nt.includes(q) ? 50 : qt.every((tok) => e.nt.includes(tok)) ? 20 : 5;
    scored.push([score, e]);
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].pos - b[1].pos).map(([, e]) => e);
}
