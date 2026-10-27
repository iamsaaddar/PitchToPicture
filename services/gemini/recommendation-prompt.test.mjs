import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = fs.readFileSync(path.join(root, "services/gemini/recommendation-prompt.ts"), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loadedModule = { exports: {} };
new Function("require", "module", "exports", javascript)(() => { throw new Error("Unexpected dependency"); }, loadedModule, loadedModule.exports);
const { buildSongToCinemaPrompt } = loadedModule.exports;

test("prompt focuses on emotional fit and never claims to analyze actual audio", () => {
  const prompt = buildSongToCinemaPrompt("Space Song", "Beach House", 5);
  assert.match(prompt, /exactly 5 distinct real feature films/i);
  assert.match(prompt, /emotional experience/i);
  assert.match(prompt, /not listening to audio/i);
  assert.match(prompt, /only the title and release year/i);
  assert.doesNotMatch(prompt, /poetic explanation|why it matches/i);
  assert.match(prompt, /JSON only/i);
});

test("prompt includes the separate song and artist and requests one replacement when needed", () => {
  const prompt = buildSongToCinemaPrompt("Her", "The American Dawn", 1, "Unverified Film");
  assert.match(prompt, /song title: "Her"/);
  assert.match(prompt, /Artist: "The American Dawn"/);
  assert.match(prompt, /Return exactly 1 distinct real feature film\./i);
  assert.match(prompt, /could not be confidently verified/i);
  assert.match(prompt, /Unverified Film/);
});
