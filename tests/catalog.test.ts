import { describe, expect, it } from 'vitest';
import { isPublicResource, project } from '../src/lib/catalog';
import { loadCatalog } from '../src/lib/load-catalog';
import { checkRules } from '../src/lib/rules';
import { buildIndex, search } from '../src/lib/search';
import { catalog, resource } from './fixtures';

describe('public projection', () => {
  const cat = catalog([
    resource('pub-1'),
    resource('draft-2', { status: 'draft' }),
    resource('withdrawn-3', { status: 'withdrawn', withdrawal_reason: 'replaced' }),
    resource('restricted-4', { rights: 'restricted' }),
    resource('nodrive-5', {}, { drive_file_id: undefined }),
    resource('notes-6', { featured: true, type: 'notes', origin: 'student_note', order: 0 }),
  ]);

  it('shows only published, approved, Drive-backed resources', () => {
    const ids = project(cat, { includeDrafts: false }).modules[0]!.resources.map((r) => r.id);
    expect(ids).toEqual(['notes-6', 'pub-1']);
  });

  it('never shows withdrawn resources, even in draft preview', () => {
    const ids = project(cat, { includeDrafts: true }).modules[0]!.resources.map((r) => r.id);
    expect(ids).not.toContain('withdrawn-3');
    expect(ids).toContain('draft-2');
  });

  it('marks non-public items as drafts in preview', () => {
    const res = project(cat, { includeDrafts: true }).modules[0]!.resources;
    expect(res.find((r) => r.id === 'draft-2')!.isDraft).toBe(true);
    expect(res.find((r) => r.id === 'pub-1')!.isDraft).toBe(false);
  });

  it('puts featured notes first regardless of order (F-02)', () => {
    const c = catalog([resource('a-1', { order: 0 }), resource('notes-2', { featured: true, order: 50 })]);
    expect(project(c, { includeDrafts: false }).modules[0]!.resources[0]!.id).toBe('notes-2');
  });

  it('does not leak private fields into the projection', () => {
    const json = JSON.stringify(project(cat, { includeDrafts: true }));
    expect(json).not.toContain('source_filename');
    expect(json).not.toContain('sha256');
    expect(json).not.toContain('rights_basis');
  });

  it('isPublicResource requires all three conditions', () => {
    expect(isPublicResource(resource('x-1'))).toBe(true);
    expect(isPublicResource(resource('x-1', { status: 'ready' }))).toBe(false);
    expect(isPublicResource(resource('x-1', { rights: 'link_only' }))).toBe(false);
    expect(isPublicResource(resource('x-1', {}, { drive_file_id: undefined }))).toBe(false);
  });
});

describe('publication rules', () => {
  it('accepts a valid catalog', () => {
    expect(checkRules(catalog([resource('a-1'), resource('b-2')]))).toEqual([]);
  });

  it('rejects published items without rights, review date or Drive ID', () => {
    const problems = checkRules(
      catalog([
        resource('a-1', { rights: 'unknown' }),
        resource('b-2', { reviewed: undefined }),
        resource('c-3', {}, { drive_file_id: undefined }),
      ]),
    );
    expect(problems.some((p) => p.includes('a-1') && p.includes('approved_public'))).toBe(true);
    expect(problems.some((p) => p.includes('b-2') && p.includes('reviewed'))).toBe(true);
    expect(problems.some((p) => p.includes('c-3') && p.includes('drive_file_id'))).toBe(true);
  });

  it('rejects duplicate ids and identical files', () => {
    const a = resource('a-1');
    const problems = checkRules(catalog([a, resource('a-1'), resource('b-2', {}, { sha256: a.revisions[0]!.sha256 })]));
    expect(problems.some((p) => p.includes('duplicate id "a-1"'))).toBe(true);
    expect(problems.some((p) => p.includes('identical current files'))).toBe(true);
  });

  it('rejects local paths and non-allowlisted hosts', () => {
    const problems = checkRules(
      catalog([resource('a-1', { official_url: 'https://example.com/x' }, { notes: 'from D:\\My UFCs\\Master' })]),
    );
    expect(problems.some((p) => p.includes('local file path'))).toBe(true);
    expect(problems.some((p) => p.includes('example.com'))).toBe(true);
  });

  it('requires current_revision to exist', () => {
    const problems = checkRules(catalog([resource('a-1', { current_revision: 'a-1-r9' })]));
    expect(problems.some((p) => p.includes('a-1-r9'))).toBe(true);
  });
});

describe('search', () => {
  const c = catalog([
    resource('ls-unit-05', { title: { original: 'Unit 05 - (Lean Startup) الوحدة  05 - منهجية الشركات الناشئة الرشيقة' } }),
    resource('eng-lesson-01', { language: 'en', title: { original: 'The Executive Summary' } }),
  ]);
  const index = buildIndex(project(c, { includeDrafts: false }));

  it('finds Arabic titles with spelling variants and digits', () => {
    expect(search(index, 'الشّركات النـاشئة').map((e) => e.id)).toEqual(['ls-unit-05']);
    expect(search(index, 'الوحدة ٥').map((e) => e.id)).toEqual(['ls-unit-05']);
  });

  it('finds Latin titles case-insensitively', () => {
    expect(search(index, 'executive SUMMARY').map((e) => e.id)).toEqual(['eng-lesson-01']);
    expect(search(index, 'lean').map((e) => e.id)).toEqual(['ls-unit-05']);
  });

  it('requires every token and applies filters', () => {
    expect(search(index, 'executive الوحدة')).toEqual([]);
    expect(search(index, '', { language: 'en' }).map((e) => e.id)).toEqual(['eng-lesson-01']);
  });

  it('excludes drafts from a production index', () => {
    const idx = buildIndex(project(catalog([resource('d-1', { status: 'draft' })]), { includeDrafts: false }));
    expect(idx.entries).toEqual([]);
  });
});

describe('repository catalog', () => {
  it('loads and passes all rules', () => {
    const cat = loadCatalog();
    expect(checkRules(cat)).toEqual([]);
    expect(cat.modules).toHaveLength(8);
  });
});
