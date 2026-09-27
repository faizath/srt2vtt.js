import { convert } from "./core.js";

export function url(srtString, options = {}) {
  if (typeof URL === "undefined" || typeof Blob === "undefined") {
    throw new Error("url() requires browser URL and Blob APIs");
  }
  return URL.createObjectURL(new Blob([convert(srtString, options)], { type: "text/vtt" }));
}

export function revokeUrl(blobUrl) {
  if (typeof URL === "undefined") throw new Error("revokeUrl() requires the browser URL API");
  URL.revokeObjectURL(blobUrl);
}

export async function run(options = {}) {
  if (typeof document === "undefined" || typeof fetch === "undefined") {
    throw new Error("run() requires browser document and fetch APIs");
  }
  const videos = document.querySelectorAll("video");
  const jobs = [];
  videos.forEach((video) => {
    Array.from(video.children).forEach((track) => {
      if (track.nodeName.toLowerCase() !== "track" || !track.src) return;
      jobs.push(fetch(track.src).then(async (response) => {
        if (response.status !== 200) throw new Error(`Failed to fetch ${track.src}: HTTP ${response.status}`);
        const text = await response.text();
        if (/^\uFEFF?WEBVTT(?:\s|$)/i.test(text.trim())) return;
        const blobUrl = url(text, options);
        track.src = blobUrl;
        options.onTrackConverted?.(track, blobUrl);
      }).catch((error) => {
        options.onError?.(error, track);
      }));
    });
  });
  await Promise.all(jobs);
}

export { convert };

if (typeof window !== "undefined") {
  window.srt2vtt = { convert, url, run, revokeUrl };
}
