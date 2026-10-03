/**
 * Cross-file publication rules that a per-file schema cannot express.
 * Run by scripts/validate-catalog.ts (and therefore by `npm run build` and CI).
 */
import type { Catalog } from './load-catalog';

export const ALLOWED_HOSTS = ['mast-cmpt.ufc.dz', 'drive.google.com', 'docs.google.com', 'notebooklm.google.com'];

const LOCAL_PATH = /(?:\b[A-Za-z]:[\\/])|(?:[\\/]Users[\\/])|(?:\\\\)/;

function* strings(value: unknown, at: string): Generator<[string, string]> {
  if (typeof value === 'string') yield [at, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${at}[${i}]`);
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) yield* strings(v, at ? `${at}.${k}` : k);
}

export function checkRules(catalog: Catalog): string[] {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  const claim = (id: string, where: string) => {
    const prev = seen.get(id);
    if (prev) problems.push(`duplicate id "${id}" (${where} and ${prev})`);
    else seen.set(id, where);
  };

  // No local paths or non-allowlisted URLs anywhere in the manifest.
  for (const [at, s] of strings(catalog, '')) {
    if (LOCAL_PATH.test(s)) problems.push(`${at}: looks like a local file path — never store local paths in the catalog`);
    if (/^https?:\/\//i.test(s)) {
      const url = new URL(s);
      if (url.protocol !== 'https:') problems.push(`${at}: URL must use https`);
      if (!ALLOWED_HOSTS.includes(url.hostname)) problems.push(`${at}: host "${url.hostname}" is not allowlisted`);
    }
  }

  const revisionIds = new Set<string>();
  for (const mod of catalog.modules) {
    claim(mod.id, `module ${mod.id}`);
    for (const res of mod.resources) {
      const where = `${mod.id}/resources ${res.id}`;
      claim(res.id, where);
      for (const rev of res.revisions) {
        claim(rev.id, `${where} revision ${rev.id}`);
        revisionIds.add(rev.id);
      }
      const current = res.revisions.find((r) => r.id === res.current_revision);
      if (!current) problems.push(`${where}: current_revision "${res.current_revision}" is not one of its revisions`);

      if (res.status === 'published') {
        if (res.rights !== 'approved_public') problems.push(`${where}: published requires rights "approved_public" (is "${res.rights}")`);
        if (!res.reviewed) problems.push(`${where}: published requires a "reviewed" date`);
        if (current && !current.drive_file_id) problems.push(`${where}: published requires a drive_file_id on the current revision`);
      }
      if (res.status === 'withdrawn' && !res.withdrawal_reason) problems.push(`${where}: withdrawn requires a withdrawal_reason`);
    }
    const shas = new Map<string, string>();
    for (const res of mod.resources) {
      const sha = res.revisions.find((r) => r.id === res.current_revision)?.sha256;
      if (!sha) continue;
      if (shas.has(sha)) problems.push(`${mod.id}: resources ${shas.get(sha)} and ${res.id} have identical current files`);
      else shas.set(sha, res.id);
    }
  }

  for (const mod of catalog.modules) {
    for (const aid of mod.aids) {
      const where = `${mod.id}/aids ${aid.id}`;
      claim(aid.id, where);
      for (const ref of aid.source_revisions) {
        if (!revisionIds.has(ref)) problems.push(`${where}: source revision "${ref}" does not exist`);
      }
      if (aid.status === 'published') {
        if (aid.review_status !== 'approved' || !aid.reviewed) problems.push(`${where}: published aid requires an approved review with a date`);
        if (aid.delivery === 'external_link' && !aid.url) problems.push(`${where}: external_link delivery requires url`);
        if (aid.delivery === 'drive_export' && !aid.drive_file_id) problems.push(`${where}: drive_export delivery requires drive_file_id`);
      }
    }
  }

  const moduleIds = new Set(catalog.modules.map((m) => m.id));
  const resourceIds = new Set(catalog.modules.flatMap((m) => m.resources.map((r) => r.id)));
  for (const upd of catalog.updates) {
    claim(upd.id, `update ${upd.id}`);
    if (!moduleIds.has(upd.module)) problems.push(`update ${upd.id}: unknown module "${upd.module}"`);
    for (const ref of upd.resource_ids) if (!resourceIds.has(ref)) problems.push(`update ${upd.id}: unknown resource "${ref}"`);
    if (upd.status === 'published' && !upd.reviewed) problems.push(`update ${upd.id}: published requires a "reviewed" date`);
  }

  return problems;
}
