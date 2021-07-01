# srt2vtt.js
Convert .srt (application/x-subrip) into .vtt (text/vtt) for HTML video

# Installation
Download the srt2vtt.js or Use these CDN
```html
<script src="https://cdn.jsdelivr.net/gh/faizath/srt2vtt.js@main/srt2vtt.js"></script>
```
or
```html
<script src="https://faizath.github.io/srt2vtt.js/srt2vtt.js"></script>
```

# Usage
## Convert srt string to webvtt string
```js
srt2vtt.convert(SRT STRING);
```
Demo: https://faizath.github.io/srt2vtt.js/sample/convert

## Create URL of webvtt file
```js
srt2vtt.url(SRT STRING);
```
Demo: https://faizath.github.io/srt2vtt.js/sample/url

## Automatically replace srt <track> with webvtt*
```js
srt2vtt.run();
```
- Demo (single video): https://faizath.github.io/srt2vtt.js/sample/autorun
- Demo (multiple videos): https://faizath.github.io/srt2vtt.js/sample/multiple-autorun

*The srt file must be able to be XMLHTTPREQUESTed

# Contributing
1.  Fork it (https://github.com/faizath/srt2vtt.js)
2.  Create your feature branch (git checkout -b my-new-feature)
3.  Commit your changes (git commit -am 'Add some feature')
4.  Push to the branch (git push origin my-new-feature)
5.  Create a new pull request
