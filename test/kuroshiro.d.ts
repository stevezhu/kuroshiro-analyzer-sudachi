declare module 'kuroshiro' {
  interface Analyzer {
    init(): Promise<void>;
    parse(text: string): Promise<unknown[]>;
  }
  interface ConvertOptions {
    to?: 'romaji' | 'hiragana' | 'katakana';
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
  }
  export default class Kuroshiro {
    init(analyzer: Analyzer): Promise<void>;
    convert(text: string, options?: ConvertOptions): Promise<string>;
  }
}
