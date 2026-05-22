import Kuroshiro from 'kuroshiro';
import { beforeAll, describe, expect, test } from 'vitest';

import SudachiAnalyzer from '../src/index.ts';

describe('kuroshiro + SudachiAnalyzer', () => {
  let kuroshiro: InstanceType<typeof Kuroshiro>;

  beforeAll(async () => {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(new SudachiAnalyzer());
  });

  test('converts kanji to romaji', async () => {
    const out = await kuroshiro.convert('猫', { to: 'romaji' });
    expect(out).toBe('neko');
  });

  test('converts mixed kanji/kana to hiragana', async () => {
    const out = await kuroshiro.convert('勉強します', { to: 'hiragana' });
    expect(out).toContain('べんきょう');
  });

  test('converts kanji to katakana', async () => {
    const out = await kuroshiro.convert('猫', { to: 'katakana' });
    expect(out).toBe('ネコ');
  });
});
