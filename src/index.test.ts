import { beforeAll, describe, expect, test } from 'vitest';

import SudachiAnalyzer, { TokenizeMode } from './index.ts';

describe('SudachiAnalyzer', () => {
  describe('lifecycle', () => {
    test('throws when parse() is called before init()', async () => {
      const analyzer = new SudachiAnalyzer();
      await expect(analyzer.parse('日本語')).rejects.toThrow(
        /not initialized/i,
      );
    });

    test('throws when init() is called twice', async () => {
      const analyzer = new SudachiAnalyzer();
      await analyzer.init();
      await expect(analyzer.init()).rejects.toThrow(/already been initialized/);
    });

    test('works with no options (uses bundled system.dic)', async () => {
      const analyzer = new SudachiAnalyzer();
      await analyzer.init();
      const tokens = await analyzer.parse('猫');
      expect(tokens.length).toBeGreaterThan(0);
    });

    test('accepts an explicit TokenizeMode', async () => {
      const analyzer = new SudachiAnalyzer({ mode: TokenizeMode.A });
      await analyzer.init();
      const tokens = await analyzer.parse('日本語');
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe('parse()', () => {
    let analyzer: SudachiAnalyzer;

    beforeAll(async () => {
      analyzer = new SudachiAnalyzer();
      await analyzer.init();
    });

    test('returns [] for empty input', async () => {
      expect(await analyzer.parse('')).toEqual([]);
    });

    test('returns [] for whitespace-only input', async () => {
      expect(await analyzer.parse('   \n\t')).toEqual([]);
    });

    test('returns tokens with surface_form, pos, and reading', async () => {
      const tokens = await analyzer.parse('日本語');
      expect(tokens.length).toBeGreaterThan(0);
      const joined = tokens.map((t) => t.surface_form).join('');
      expect(joined).toBe('日本語');
      for (const token of tokens) {
        expect(typeof token.surface_form).toBe('string');
        expect(token.surface_form.length).toBeGreaterThan(0);
      }
    });

    test('emits katakana readings for kanji tokens', async () => {
      const tokens = await analyzer.parse('日本語');
      const withReading = tokens.find((t) => t.reading && t.reading.length > 0);
      expect(withReading).toBeDefined();
      expect(withReading?.reading).toMatch(/^\p{Script_Extensions=Katakana}+$/u);
    });

    test('preserves surface order across morpheme boundaries', async () => {
      const text = '日本語を勉強します';
      const tokens = await analyzer.parse(text);
      expect(tokens.map((t) => t.surface_form).join('')).toBe(text);
    });
  });
});
