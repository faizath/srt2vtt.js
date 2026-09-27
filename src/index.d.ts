export interface ConvertOptions {
  sanitize?: boolean;
  allowVttMarkup?: boolean;
  strict?: boolean;
  preserveCueIds?: boolean;
}

export interface ConvertError {
  cueIndex: number;
  message: string;
}

export interface StrictConvertResult {
  vtt: string;
  errors: ConvertError[];
}

export function convert(
  srtString: string,
  options?: ConvertOptions
): string;
export function convert(
  srtString: string,
  options: ConvertOptions & { strict: true }
): StrictConvertResult;

export default convert;
