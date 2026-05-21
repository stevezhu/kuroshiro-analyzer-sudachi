# kuroshiro-analyzer-sudachi

[Sudachi][sudachi]-backed morphological analyzer for [kuroshiro][kuroshiro], built on [sudachi-wasm333][sudachi-wasm333]. Works out of the box with the `system.dic` bundled by sudachi-wasm333; point it at a larger [SudachiDict][sudachidict] file for broader coverage.

Drop-in replacement for the older [kuroshiro-analyzer-kuromoji][analyzer-kuromoji] (kuromoji.js + the 2007-era IPA dictionary) when you want broader, more modern Japanese coverage — proper-noun handling, recent vocabulary, brand names, all the things kuromoji's IPA dict misses.

## Install

```sh
pnpm add kuroshiro kuroshiro-analyzer-sudachi
```

## Usage

```ts
import Kuroshiro from "kuroshiro";
import SudachiAnalyzer from "kuroshiro-analyzer-sudachi";

const kuroshiro = new Kuroshiro();
await kuroshiro.init(new SudachiAnalyzer());

await kuroshiro.convert("日本語を勉強します", { to: "romaji" });
// → "nihongo wo benkyou shi masu"
```

To use a different SudachiDict, download `small` / `core` / `full` from [WorksApplications/SudachiDict][sudachidict] or the [S3 mirror][sudachidict-s3] and pass an absolute path:

```ts
await kuroshiro.init(new SudachiAnalyzer({ dictPath: "/path/to/system_full.dic" }));
```

### Options

```ts
new SudachiAnalyzer({
  dictPath?: string,          // optional — absolute path to a SudachiDict .dic file; defaults to the system.dic bundled with sudachi-wasm333
  mode?: TokenizeMode,        // default: TokenizeMode.C (longest tokens)
})
```

`TokenizeMode` is re-exported from this package; see the [Sudachi modes documentation][sudachi-modes] for the difference between A (shortest), B (middle), and C (longest / named-entity).

### Token shape

`parse()` returns the subset of fields kuroshiro actually reads:

```ts
{
  surface_form: string,
  pos?: string,
  reading?: string,
}
```

`pronunciation` is intentionally not set — Sudachi exposes no separate pronunciation field, and kuroshiro's `pronunciation || reading` fallback lands on the right value either way. `reading` may be empty for OOV tokens (ASCII, punctuation, numbers); kuroshiro's `patchTokens` fills it in from the surface for those.

## Caveats

- **No particle override.** Sudachi emits the lexical reading for particles, so `は` romanizes as `ha`, not `wa`. If you need the spoken form, post-process the output or wrap this analyzer.
- **No long-vowel macron.** Sudachi's `reading_form` uses literal kana (ベンキョウ); kuroshiro can only produce macron output (`benkyō`) when given a `pronunciation` field with the 長音 mark (ベンキョー). Output here will be the literal double-vowel form (`benkyou`).

If either matters for your use case, kuromoji (via `kuroshiro-analyzer-kuromoji`) handles them natively.

## License

MIT © Steve Zhu

[kuroshiro]: https://github.com/hexenq/kuroshiro
[sudachi]: https://github.com/WorksApplications/Sudachi
[sudachidict]: https://github.com/WorksApplications/SudachiDict
[sudachidict-s3]: http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/
[sudachi-wasm333]: https://github.com/Benjas333/sudachi-wasm333
[sudachi-modes]: https://github.com/WorksApplications/Sudachi#the-modes-of-splitting
[analyzer-kuromoji]: https://github.com/hexenq/kuroshiro-analyzer-kuromoji
