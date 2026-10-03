import { describe, expect, it } from 'vitest';
import { bidiText } from '../src/lib/bidi';
import { normalize, tokens } from '../src/lib/normalize';

describe('normalize (F-04)', () => {
  it('removes Arabic diacritics and tatweel', () => {
    expect(normalize('الشّركات النـاشئة')).toBe(normalize('الشركات الناشئة'));
    expect(normalize('المُحَاسَبَة')).toBe('المحاسبة');
  });

  it('folds alef variants to bare alef', () => {
    expect(normalize('إعداد')).toBe('اعداد');
    expect(normalize('أساسية')).toBe('اساسية');
    expect(normalize('آليات')).toBe('اليات');
  });

  it('keeps alif maqsura distinct unless folding is requested', () => {
    expect(normalize('مستوى')).not.toBe(normalize('مستوي'));
    expect(normalize('مستوى', { foldAlifMaqsura: true })).toBe(normalize('مستوي'));
  });

  it('maps Arabic-Indic digits and drops leading zeros', () => {
    expect(normalize('الوحدة ٠٥')).toBe('الوحدة 5');
    expect(normalize('Unit 05')).toBe('unit 5');
    expect(normalize('IFRS 9')).toBe('ifrs 9');
    expect(normalize('2025-2026')).toBe('2025 2026');
  });

  it('folds Latin case and accents', () => {
    expect(normalize('Présentation ÉCONOMIQUE')).toBe('presentation economique');
  });

  it('splits punctuation into tokens', () => {
    expect(tokens('(MVP) الوحدة 08 - المنتج الأولي')).toEqual(['mvp', 'الوحدة', '8', 'المنتج', 'الاولي']);
    expect(tokens('   ')).toEqual([]);
  });
});

describe('bidiText', () => {
  it('isolates Latin parentheticals inside Arabic text', () => {
    expect(bidiText('المؤسسات الناشئة المرنة (Lean Startup)')).toBe('المؤسسات الناشئة المرنة \u200E(Lean Startup)\u200E');
  });

  it('leaves Latin-only and Arabic parentheticals alone', () => {
    expect(bidiText('The Executive Summary (draft)')).toBe('The Executive Summary (draft)');
    expect(bidiText('الوحدة (الأولى)')).toBe('الوحدة (الأولى)');
  });
});
