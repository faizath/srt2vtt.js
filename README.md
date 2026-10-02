# srt2vtt-js

Convert SubRip (`.srt`) subtitles to WebVTT in Node.js or a browser.

## Installation

```sh
npm install srt2vtt-js
```

## Node API

```js
import { convert } from "srt2vtt-js";

const vtt = convert(srtString);
```

`convert(srtString, options)` returns a string beginning with `WEBVTT`. Options are:

| Option | Default | Description |
| --- | --- | --- |
| `sanitize` | `true` | Escape `&`, `<`, and `>` in cue text. |
| `allowVttMarkup` | `false` | Preserve known safe VTT tags while sanitizing. |
| `preserveCueIds` | `true` | Keep cue identifier lines. |
| `strict` | `false` | Return `{vtt, errors}` instead of a string; invalid cues are reported. |

## Browser API

Import browser helpers separately:

```js
import { url, revokeUrl, run } from "srt2vtt-js/browser";

const blobUrl = url(srtString);
// use blobUrl as a <track src>, then:
revokeUrl(blobUrl);
await run({ onTrackConverted: (track, convertedUrl) => console.log(convertedUrl) });
```

`run()` fetches every SRT `<track>` inside every `<video>` and replaces its source. The
subtitle URL must be fetchable by the browser and return HTTP 200; configure CORS on
the subtitle server. Network and conversion errors are passed to `onError`.

Subtitle files are untrusted input. Sanitization is enabled by default; only enable
`allowVttMarkup` for trusted content.

## CLI

```sh
srt2vtt input.srt
srt2vtt input.srt -o output.vtt
srt2vtt input.srt --no-sanitize
```

Invalid input exits non-zero. Without `-o`, output is written to stdout.

## CDN / legacy browser script

The root `srt2vtt.js` is the compatibility IIFE and exposes
`window.srt2vtt.convert`, `.url`, `.run`, and `.revokeUrl`. A built copy is also
available at `dist/iife/browser.global.js` after `npm run build`.

```html
<script src="https://cdn.jsdelivr.net/gh/faizath/srt2vtt.js@main/srt2vtt.js"></script>
<script>const vtt = srt2vtt.convert(srtText);</script>
```

## Development

```sh
npm test
npm run build
```

MIT licensed. See [LICENSE](LICENSE), [NOTICE](NOTICE), and [SECURITY.md](SECURITY.md).
