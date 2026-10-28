import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { z } from "zod";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "schemas/recommendations.ts"), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loadedModule = { exports: {} };
new Function("require", "module", "exports", javascript)((specifier) => {
  if (specifier === "zod") return { z };
  if (specifier === "@/schemas/movie") {
    return { VerifiedMovieSchema: z.object({
      tmdbId: z.number().int().positive(),
      title: z.string().trim().min(1).max(300),
      releaseDate: z.string().max(10),
      overview: z.string().max(2000),
      posterPath: z.string().max(200).nullable(),
      rating: z.number().min(0).max(10),
    }).strict() };
  }
  throw new Error(`Unexpected dependency: ${specifier}`);
}, loadedModule, loadedModule.exports);

const { RecommendationRequestSchema, RecommendationCandidateSchema, GeminiRecommendationOutputSchema, RecommendationResponseSchema } = loadedModule.exports;

test("song requests require separate, bounded title and artist fields", () => {
  assert.equal(RecommendationRequestSchema.safeParse({ songTitle: "Space Song", artist: "Beach House", decades: [], languages: [] }).success, true);
  assert.equal(RecommendationRequestSchema.safeParse({ songTitle: "Space Song", artist: "", decades: [], languages: [] }).success, false);
  assert.equal(RecommendationRequestSchema.safeParse({ songTitle: "x".repeat(161), artist: "Artist", decades: [], languages: [] }).success, false);
  assert.equal(RecommendationRequestSchema.safeParse({ songTitle: "Song", artist: "Artist", decades: [1930], languages: [] }).success, false);
  assert.equal(RecommendationRequestSchema.safeParse({ songTitle: "Song", artist: "Artist", decades: [], languages: ["invalid-code"] }).success, false);
});

test("Gemini output schema requires exactly the requested number of well-formed candidates", () => {
  const candidate = { title: "Arrival", year: 2016 };
  assert.equal(GeminiRecommendationOutputSchema(5).safeParse({ candidates: Array(5).fill(candidate) }).success, true);
  assert.equal(GeminiRecommendationOutputSchema(5).safeParse({ candidates: Array(4).fill(candidate) }).success, false);
  assert.equal(RecommendationCandidateSchema.safeParse({ ...candidate, reason: "No longer needed." }).success, false);
  assert.equal(RecommendationCandidateSchema.safeParse({ ...candidate, extra: true }).success, false);
});

test("results permit only verified movie fields and between one and seven recommendations", () => {
  const item = { movie: { tmdbId: 1, title: "Arrival", releaseDate: "2016-11-11", overview: "A thoughtful story.", posterPath: "/arrival.jpg", rating: 7.9 } };
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: [item] }).success, false);
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: Array(4).fill(item) }).success, true);
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: Array(3).fill(item) }).success, false);
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: Array(7).fill(item) }).success, true);
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: Array(8).fill(item) }).success, false);
  assert.equal(RecommendationResponseSchema.safeParse({ recommendations: [{ ...item, movie: { ...item.movie, tmdbId: 0 } }] }).success, false);
});
