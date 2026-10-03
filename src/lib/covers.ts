import type { ImageMetadata } from 'astro';

// Covers live next to the manifest (catalog/covers) and are optimized by astro:assets at build time.
const covers = import.meta.glob<ImageMetadata>('/catalog/covers/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

export function coverImage(file: string | undefined): ImageMetadata | undefined {
  return file ? covers[`/catalog/covers/${file}`] : undefined;
}
