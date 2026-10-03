/**
 * Release identifier (deployment-specification §5): CI compares `commit` with the pushed SHA to
 * confirm the new build is actually being served. Also used by the container's readiness check.
 */
import { getPublicCatalog } from '../lib/catalog';

export function GET() {
  const { modules } = getPublicCatalog();
  const body = {
    commit: process.env.RELEASE_SHA || 'dev',
    built: new Date().toISOString(),
    modules: modules.length,
    resources: modules.reduce((n, m) => n + m.resources.length, 0),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
