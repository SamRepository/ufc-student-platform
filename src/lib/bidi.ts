const ARABIC = /[\u0600-\u06FF]/;
const LATIN_PARENTHETICAL = /\(([^()\u0600-\u06FF]*[A-Za-z][^()\u0600-\u06FF]*)\)/g;
const LRM = '\u200E';

/**
 * Display-only bidi fix: a Latin parenthetical inside Arabic text, e.g. "المرنة (Lean Startup)",
 * otherwise renders as "Lean) … (Startup" because the brackets take the Arabic direction.
 * Left-to-right marks make the brackets belong to the Latin run. Never used for search or IDs.
 */
export const bidiText = (text: string) => (ARABIC.test(text) ? text.replace(LATIN_PARENTHETICAL, `${LRM}($1)${LRM}`) : text);
