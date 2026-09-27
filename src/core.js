// Conversion logic adapted from Silvia Pfeiffer's SRT conversion example.

const TIMESTAMP =
  /^\s*(?:(\d+):)?(\d{2}):(\d{2})(?:[,.](\d{1,3}))?\s*-->\s*(?:(\d+):)?(\d{2}):(\d{2})(?:[,.](\d{1,3}))?(?:\s+.*)?$/;
const SAFE_TAG =
  /<\/?(?:b|i|u|ruby|rt|c(?:\.[\w-]+)*|v(?:\s+[^<>]*)?|lang(?:\s+[^<>]*)?)>/gi;

function escapeText(text, sanitize, allowVttMarkup) {
  if (!sanitize) return text;
  if (allowVttMarkup) {
    const tags = [];
    const protectedText = text.replace(SAFE_TAG, (tag) => {
      tags.push(tag);
      return `\u0000${tags.length - 1}\u0000`;
    });
    return protectedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\u0000(\d+)\u0000/g, (_, index) => tags[index]);
  }
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatTimestamp(match, start) {
  const hours = start ? (match[1] || "0") : (match[5] || "0");
  const minutes = start ? match[2] : match[6];
  const seconds = start ? match[3] : match[7];
  const milliseconds = start ? match[4] : match[8];
  return `${hours.padStart(2, "0")}:${minutes}:${seconds}.${(milliseconds || "0")
    .padEnd(3, "0")}`;
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

export function convert(srtString, options = {}) {
  if (typeof srtString !== "string") {
    throw new TypeError("srtString must be a string");
  }
  const settings = {
    sanitize: options.sanitize !== false,
    allowVttMarkup: options.allowVttMarkup === true,
    strict: options.strict === true,
    preserveCueIds: options.preserveCueIds !== false,
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
  const vtt = `WEBVTT\n\n${cues.length ? `${cues.join("\n\n")}\n\n` : ""}`;
  return settings.strict ? { vtt, errors } : vtt;
}

export default convert;
