#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { convert } from "./core.js";

function usage() {
  console.error("Usage: srt2vtt input.srt [-o output.vtt] [--no-sanitize]");
}

async function main() {
  const args = process.argv.slice(2);
  const noSanitize = args.includes("--no-sanitize");
  const positional = args.filter((arg) => arg !== "--no-sanitize");
  const input = positional[0];
  const outputIndex = positional.indexOf("-o");
  const output = outputIndex >= 0 ? positional[outputIndex + 1] : null;
  if (!input || (outputIndex >= 0 && !output)) {
    usage();
    process.exitCode = 2;
  } else {
    try {
      const source = await fs.readFile(input, "utf8");
      const result = convert(source, { sanitize: !noSanitize, strict: true });
      if (result.errors.length) {
        for (const error of result.errors) console.error(`Cue ${error.cueIndex}: ${error.message}`);
        process.exitCode = 1;
      } else if (output) {
        await fs.writeFile(output, result.vtt);
      } else {
        process.stdout.write(result.vtt);
      }
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}

main();
