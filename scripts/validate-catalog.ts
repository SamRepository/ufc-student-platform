/**
 * Validates ./catalog: per-file schema (src/lib/schema.ts) plus cross-file publication rules
 * (src/lib/rules.ts). Exit code 1 on any problem. Runs before every build and in CI.
 */
import { CatalogError, loadCatalog } from '../src/lib/load-catalog';
import { checkRules } from '../src/lib/rules';
import { isPublicResource } from '../src/lib/catalog';

try {
  const catalog = loadCatalog();
  const problems = checkRules(catalog);
  if (problems.length) {
    console.error(`✗ ${problems.length} rule violation(s):\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  const all = catalog.modules.flatMap((m) => m.resources);
  const published = all.filter(isPublicResource).length;
  console.log(`✓ catalog valid: ${catalog.modules.length} modules, ${all.length} resources (${published} public, ${all.length - published} not public), ${catalog.updates.length} updates`);
} catch (err) {
  if (err instanceof CatalogError) {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  }
  throw err;
}
