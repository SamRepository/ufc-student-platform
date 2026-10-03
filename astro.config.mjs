// @ts-check
import { defineConfig } from 'astro/config';

// Static output only (Phase 1, Option B): the catalog is read from ./catalog at build time.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/': '/ar/',
  },
});
