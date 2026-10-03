/**
 * Reads and schema-validates the YAML manifest under ./catalog.
 * Layout:
 *   catalog/semester.yaml
 *   catalog/updates.yaml                  (top-level list)
 *   catalog/modules/<id>/module.yaml
 *   catalog/modules/<id>/resources.yaml   (top-level list, may be [])
 *   catalog/covers/<file>
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import {
  moduleSchema,
  resourcesFileSchema,
  semesterSchema,
  updatesFileSchema,
  type ModuleData,
  type Resource,
  type Semester,
  type Update,
} from './schema';

export interface CatalogModule extends ModuleData {
  resources: Resource[];
}

export interface Catalog {
  semester: Semester;
  modules: CatalogModule[];
  updates: Update[];
}

export class CatalogError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Catalog is invalid:\n  - ${problems.join('\n  - ')}`);
    this.name = 'CatalogError';
  }
}

export const DEFAULT_CATALOG_DIR = path.resolve(process.cwd(), 'catalog');

function readYaml(file: string, problems: string[]): unknown {
  if (!existsSync(file)) {
    problems.push(`${file}: file is missing`);
    return undefined;
  }
  try {
    return parse(readFileSync(file, 'utf8'));
  } catch (err) {
    problems.push(`${file}: YAML parse error: ${(err as Error).message}`);
    return undefined;
  }
}

function check<S extends z.ZodType>(schema: S, value: unknown, file: string, problems: string[]): z.infer<S> | undefined {
  if (value === undefined) return undefined;
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    problems.push(`${file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
  return undefined;
}

export function loadCatalog(dir: string = DEFAULT_CATALOG_DIR): Catalog {
  const problems: string[] = [];
  const rel = (f: string) => path.relative(path.dirname(dir), f).replaceAll('\\', '/');

  const semesterFile = path.join(dir, 'semester.yaml');
  const semester = check(semesterSchema, readYaml(semesterFile, problems), rel(semesterFile), problems);

  const updatesFile = path.join(dir, 'updates.yaml');
  const updates = check(updatesFileSchema, readYaml(updatesFile, problems) ?? [], rel(updatesFile), problems) ?? [];

  const modules: CatalogModule[] = [];
  for (const id of semester?.modules ?? []) {
    const moduleFile = path.join(dir, 'modules', id, 'module.yaml');
    const resourcesFile = path.join(dir, 'modules', id, 'resources.yaml');
    const mod = check(moduleSchema, readYaml(moduleFile, problems), rel(moduleFile), problems);
    const resources = check(resourcesFileSchema, readYaml(resourcesFile, problems) ?? [], rel(resourcesFile), problems);
    if (!mod || !resources) continue;
    if (mod.id !== id) problems.push(`${rel(moduleFile)}: id "${mod.id}" does not match its folder "${id}"`);
    if (mod.cover && !existsSync(path.join(dir, 'covers', mod.cover))) {
      problems.push(`${rel(moduleFile)}: cover "${mod.cover}" not found in catalog/covers/`);
    }
    modules.push({ ...mod, resources });
  }

  if (problems.length > 0 || !semester) throw new CatalogError(problems);
  return { semester, modules, updates };
}
