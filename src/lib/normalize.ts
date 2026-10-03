/**
 * Search normalization (F-04). Originals are always displayed as written; these forms are
 * used only for matching. Shared by the build-time index and the in-browser search.
 *
 * - Arabic: strip diacritics/Quranic marks and tatweel, fold alef variants to bare alef,
 *   map Arabic-Indic digits to Latin digits.
 * - Latin: lowercase and strip accents.
 * - Numbers: leading zeros dropped so "05" matches "5".
 * Alif maqsura / ya folding is deliberately OFF until tested against course titles (F-04).
 */

const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g; // آ أ إ ٱ
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;

export interface NormalizeOptions {
  foldAlifMaqsura?: boolean;
}

export function normalize(input: string, options: NormalizeOptions = {}): string {
  let s = input
    .replace(ALEF_VARIANTS, '\u0627')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '') // Latin accents and any Arabic combining marks left after NFD
    .replace(ARABIC_MARKS, '')
    .replace(TATWEEL, '')
    .replace(ARABIC_INDIC_DIGITS, (d) => String(d.codePointAt(0)! & 0x0f)) // U+0660–0669 and U+06F0–06F9 end in 0–9
    .toLowerCase();
  if (options.foldAlifMaqsura) s = s.replace(/\u0649/g, '\u064A');
  return s
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/(^|\D)0+(?=\d)/g, '$1')
    .trim();
}

export function tokens(input: string): string[] {
  const n = normalize(input);
  return n ? n.split(' ') : [];
}
