import { getPublicCatalog } from '../lib/catalog';
import { buildIndex } from '../lib/search';

export function GET() {
  return new Response(JSON.stringify(buildIndex(getPublicCatalog())), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
