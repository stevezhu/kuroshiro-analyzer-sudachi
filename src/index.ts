import { promises as fsp } from 'node:fs';

import { SudachiStateless, TokenizeMode } from 'sudachi-wasm333';

export { TokenizeMode };

/**
 * Subset of kuroshiro's token contract this analyzer emits. kuroshiro's
 * own consumption (core.js / util.js) only reads `surface_form`, `pos`,
 * `reading`, and `pronunciation` — the wider JSDoc in
 * `kuroshiro-analyzer-kuromoji` documents fields kuroshiro never references
 * (`pos_detail_*`, `conjugated_*`, `basic_form`, `verbose`), so we omit
 * them. `pronunciation` is unset because Sudachi has no separate
 * pronunciation field; kuroshiro's `pronunciation || reading` fallback
 * (core.js:103, 168) lands on the right value either way.
 */
export interface KuroshiroToken {
  /** 表層形 — always present. */
  surface_form: string;
  /** 品詞 — Sudachi's top-level POS. */
  pos?: string;
  /** 読み (katakana). Empty for OOV (ASCII, punctuation); kuroshiro's
   * `patchTokens` (util.js:1480) fills the gap. */
  reading?: string;
}

export interface SudachiAnalyzerOptions {
  /**
   * Absolute path to a SudachiDict `.dic` file. Required — the consumer is
   * responsible for installing SudachiDict (small / core / full). Download
   * from https://github.com/WorksApplications/SudachiDict or
   * http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/
   */
  dictPath: string;
  /**
   * Sudachi split mode. Defaults to `TokenizeMode.C` (longest tokens —
   * keeps compounds and named entities intact, the right choice for
   * furigana / romaji output).
   */
  mode?: TokenizeMode;
}

/**
 * Kuroshiro analyzer backed by Sudachi (via sudachi-wasm333). Conforms to
 * the analyzer interface kuroshiro.init() accepts: an object with async
 * `init()` and `parse(text)` methods.
 *
 * @example
 *   import Kuroshiro from 'kuroshiro';
 *   import SudachiAnalyzer from 'kuroshiro-analyzer-sudachi';
 *
 *   const kuroshiro = new Kuroshiro();
 *   await kuroshiro.init(new SudachiAnalyzer({ dictPath: '/path/to/system_full.dic' }));
 *   await kuroshiro.convert('日本語を勉強します', { to: 'romaji' });
 */
export default class SudachiAnalyzer {
  private sudachi: SudachiStateless | null = null;
  private readonly dictPath: string;
  private readonly mode: TokenizeMode;

  constructor(opts: SudachiAnalyzerOptions) {
    this.dictPath = opts.dictPath;
    this.mode = opts.mode ?? TokenizeMode.C;
  }

  /**
   * Loads the SudachiDict file and prepares the tokenizer. Must be called
   * once before `parse`. Rejects if already initialized.
   */
  async init(): Promise<void> {
    if (this.sudachi) {
      throw new Error('SudachiAnalyzer has already been initialized.');
    }
    const s = new SudachiStateless();
    await s.initialize_node(fsp.readFile, this.dictPath);
    this.sudachi = s;
  }

  /**
   * Tokenizes `text` and returns morphemes in the shape kuroshiro consumes.
   * Returns `[]` for empty or whitespace-only input (matching
   * kuroshiro-analyzer-kuromoji's `str.trim() === ''` short-circuit).
   * Whitespace inside non-empty input is preserved as Sudachi 空白-POS
   * tokens.
   */
  async parse(text: string): Promise<KuroshiroToken[]> {
    if (!this.sudachi) {
      throw new Error(
        'SudachiAnalyzer is not initialized. Call init() before parse().',
      );
    }
    if (text.trim() === '') return [];
    const morphemes = this.sudachi.tokenize_raw(text, this.mode);
    return morphemes.map((m) => ({
      surface_form: m.surface,
      pos: m.poses[0],
      reading: m.reading_form,
    }));
  }
}
