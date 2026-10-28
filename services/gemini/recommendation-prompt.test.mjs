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
  const prompt = buildSongToCinemaPrompt("Space Song", "Beach House", 6, { decades: [1990, 2000], languages: ["en", "ja"], languageLabels: ["English", "Japanese"] });
  assert.match(prompt, /exactly 6 distinct real feature films/i);
  assert.match(prompt, /emotional experience/i);
  assert.match(prompt, /not listening to live audio/i);
  assert.match(prompt, /Do not invent the song's key, tempo, instruments/i);
  assert.match(prompt, /BUILD AN EMOTIONAL FINGERPRINT/i);
  assert.match(prompt, /TRANSLATE THE FEELING INTO CINEMA/i);
  assert.match(prompt, /COMPARE CANDIDATES/i);
  assert.match(prompt, /BALANCE VARIETY WITH FIT/i);
  assert.match(prompt, /FACT-CHECK AND FINALIZE/i);
  assert.match(prompt, /broader pool of plausible films/i);
  assert.match(prompt, /only the title and release year/i);
  assert.doesNotMatch(prompt, /poetic explanation|why it matches/i);
  assert.match(prompt, /no prose/i);
  assert.match(prompt, /1990s \(1990-1999\), 2000s \(2000-2009\)/);
  assert.match(prompt, /Allowed original-language TMDB codes: English \(en\), Japanese \(ja\)/);
});

test("prompt includes the separate song and artist and requests one replacement when needed", () => {
  const prompt = buildSongToCinemaPrompt("Her", "The American Dawn", 1, { decades: [], languages: [] }, ["Unverified Film"]);
  assert.match(prompt, /song title: "Her"/);
  assert.match(prompt, /Artist: "The American Dawn"/);
  assert.match(prompt, /Return exactly 1 distinct real feature film in the existing structured format/i);
  assert.match(prompt, /failed TMDB verification/i);
  assert.match(prompt, /Unverified Film/);
});
