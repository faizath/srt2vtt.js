import { describe, expect, it } from "vitest";
import { convert } from "../src/core.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const fixture = (name) => fs.readFileSync(path.join(fixtureDir, `${name}.srt`), "utf8");
const expected = (name) => fs.readFileSync(path.join(fixtureDir, `${name}.vtt`), "utf8");

describe("convert", () => {
  for (const name of ["basic", "multi-line", "numeric-id", "mm-ss", "missing-ms", "bom", "sanitize"]) {
    it(`converts ${name}`, () => expect(convert(fixture(name))).toBe(expected(name)));
  }

  it("reports invalid cues in strict mode", () => {
    const result = convert("1\nnot a timestamp\nText", { strict: true });
    expect(result.errors).toHaveLength(1);
    expect(result.vtt).toBe("WEBVTT\n\n");
  });

  it("preserves safe markup when requested", () => {
    expect(convert("1\n00:00:00,000 --> 00:00:01,000\n<b>Hi</b>", { allowVttMarkup: true }))
      .toContain("<b>Hi</b>");
  });

  it("can omit cue IDs and sanitization", () => {
    const result = convert("42\n00:00:00,000 --> 00:00:01,000\n<a>&", {
      preserveCueIds: false,
      sanitize: false,
    });
    expect(result).toContain("<a>&");
    expect(result).not.toContain("\n42\n");
  });
});
