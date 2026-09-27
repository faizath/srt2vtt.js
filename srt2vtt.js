var srt2vtt = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browser.js
  var browser_exports = {};
  __export(browser_exports, {
    convert: () => convert,
    revokeUrl: () => revokeUrl,
    run: () => run,
    url: () => url
  });

  // src/core.js
  var TIMESTAMP = /^\s*(?:(\d+):)?(\d{2}):(\d{2})(?:[,.](\d{1,3}))?\s*-->\s*(?:(\d+):)?(\d{2}):(\d{2})(?:[,.](\d{1,3}))?(?:\s+.*)?$/;
  var SAFE_TAG = /<\/?(?:b|i|u|ruby|rt|c(?:\.[\w-]+)*|v(?:\s+[^<>]*)?|lang(?:\s+[^<>]*)?)>/gi;
  function escapeText(text, sanitize, allowVttMarkup) {
    if (!sanitize) return text;
    if (allowVttMarkup) {
      const tags = [];
      const protectedText = text.replace(SAFE_TAG, (tag) => {
        tags.push(tag);
        return `\0${tags.length - 1}\0`;
      });
      return protectedText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u0000(\d+)\u0000/g, (_, index) => tags[index]);
    }
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function formatTimestamp(match, start) {
    const hours = start ? match[1] || "0" : match[5] || "0";
    const minutes = start ? match[2] : match[6];
    const seconds = start ? match[3] : match[7];
    const milliseconds = start ? match[4] : match[8];
    return `${hours.padStart(2, "0")}:${minutes}:${seconds}.${(milliseconds || "0").padEnd(3, "0")}`;
  }
  function parseCue(block, cueIndex, options) {
    const lines = block.split("\n");
    let line = 0;
    let id = "";
    if (!TIMESTAMP.test(lines[0] || "")) {
      if (lines.length < 2 || !TIMESTAMP.test(lines[1])) {
        return { error: "Missing or invalid timestamp" };
      }
      id = lines[0];
      line = 1;
    }
    const timestamp = lines[line].match(TIMESTAMP);
    if (!timestamp) return { error: "Missing or invalid timestamp" };
    const output = [];
    if (options.preserveCueIds && id) output.push(id);
    output.push(`${formatTimestamp(timestamp, true)} --> ${formatTimestamp(timestamp, false)}`);
    const text = lines.slice(line + 1).join("\n");
    output.push(escapeText(text, options.sanitize, options.allowVttMarkup));
    return { value: output.join("\n") };
  }
  function convert(srtString, options = {}) {
    if (typeof srtString !== "string") {
      throw new TypeError("srtString must be a string");
    }
    const settings = {
      sanitize: options.sanitize !== false,
      allowVttMarkup: options.allowVttMarkup === true,
      strict: options.strict === true,
      preserveCueIds: options.preserveCueIds !== false
    };
    const normalized = srtString.replace(/^\uFEFF/, "").replace(/\r\n?|\u2028|\u2029/g, "\n").trim();
    const blocks = normalized ? normalized.split(/\n{2,}/) : [];
    const errors = [];
    const cues = [];
    blocks.forEach((block, index) => {
      if (/^WEBVTT(?:\s|$)/i.test(block)) return;
      const parsed = parseCue(block, index, settings);
      if (parsed.error) {
        errors.push({ cueIndex: index, message: parsed.error });
      } else {
        cues.push(parsed.value);
      }
    });
    const vtt = `WEBVTT

${cues.length ? `${cues.join("\n\n")}

` : ""}`;
    return settings.strict ? { vtt, errors } : vtt;
  }

  // src/browser.js
  function url(srtString, options = {}) {
    if (typeof URL === "undefined" || typeof Blob === "undefined") {
      throw new Error("url() requires browser URL and Blob APIs");
    }
    return URL.createObjectURL(new Blob([convert(srtString, options)], { type: "text/vtt" }));
  }
  function revokeUrl(blobUrl) {
    if (typeof URL === "undefined") throw new Error("revokeUrl() requires the browser URL API");
    URL.revokeObjectURL(blobUrl);
  }
  async function run(options = {}) {
    if (typeof document === "undefined" || typeof fetch === "undefined") {
      throw new Error("run() requires browser document and fetch APIs");
    }
    const videos = document.querySelectorAll("video");
    const jobs = [];
    videos.forEach((video) => {
      Array.from(video.children).forEach((track) => {
        if (track.nodeName.toLowerCase() !== "track" || !track.src) return;
        jobs.push(fetch(track.src).then(async (response) => {
          var _a;
          if (response.status !== 200) throw new Error(`Failed to fetch ${track.src}: HTTP ${response.status}`);
          const text = await response.text();
          if (/^\uFEFF?WEBVTT(?:\s|$)/i.test(text.trim())) return;
          const blobUrl = url(text, options);
          track.src = blobUrl;
          (_a = options.onTrackConverted) == null ? void 0 : _a.call(options, track, blobUrl);
        }).catch((error) => {
          var _a;
          (_a = options.onError) == null ? void 0 : _a.call(options, error, track);
        }));
      });
    });
    await Promise.all(jobs);
  }
  if (typeof window !== "undefined") {
    window.srt2vtt = { convert, url, run, revokeUrl };
  }
  return __toCommonJS(browser_exports);
})();
