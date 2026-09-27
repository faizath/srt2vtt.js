import type { ConvertOptions } from "./index.js";

export { convert, type ConvertOptions, type ConvertError, type StrictConvertResult } from "./index.js";
export { default } from "./index.js";

export interface RunOptions extends ConvertOptions {
  onTrackConverted?: (track: HTMLTrackElement, blobUrl: string) => void;
  onError?: (error: Error, track: HTMLTrackElement) => void;
}

export function url(srtString: string, options?: ConvertOptions): string;
export function revokeUrl(blobUrl: string): void;
export function run(options?: RunOptions): Promise<void>;

declare global {
  interface Window {
    srt2vtt: {
      convert: typeof import("./index.js").convert;
      url: typeof url;
      run: typeof run;
      revokeUrl: typeof revokeUrl;
    };
  }
}
