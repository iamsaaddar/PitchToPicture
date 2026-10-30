import "server-only";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { GeminiClientError, getGeminiClient } from "@/services/gemini/client";
import {
  GeminiRecommendationOutputSchema,
  RecommendationCandidateSchema,
  TARGET_RECOMMENDATION_COUNT,
  MAX_RECOMMENDATION_COUNT,
  type RecommendationCandidate,
  type RecommendationRequest,
} from "@/schemas/recommendations";
import { buildSongToCinemaPrompt } from "./recommendation-prompt";

type GeminiSchema = Parameters<ReturnType<typeof getGeminiClient>["generateStructured"]>[1];
const geminiTypes: Record<string, string> = {
  string: "STRING",
  number: "NUMBER",
  integer: "INTEGER",
  boolean: "BOOLEAN",
  object: "OBJECT",
  array: "ARRAY",
};

function convertSchema(value: unknown): GeminiSchema {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected JSON schema object.");
  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  if (typeof source.type === "string") target.type = geminiTypes[source.type] ?? source.type;
  for (const field of [
    "description",
    "required",
    "enum",
    "minimum",
    "maximum",
    "nullable",
  ] as const)
    if (source[field] !== undefined) target[field] = source[field];
  for (const field of ["minItems", "maxItems", "minLength", "maxLength"] as const) {
    if (typeof source[field] === "number") target[field] = String(source[field]);
  }
  if (
    source.properties &&
    typeof source.properties === "object" &&
    !Array.isArray(source.properties)
  )
    target.properties = Object.fromEntries(
      Object.entries(source.properties).map(([key, item]) => [key, convertSchema(item)]),
    );
  if (source.items) target.items = convertSchema(source.items);
  const union = Array.isArray(source.anyOf)
    ? source.anyOf
    : Array.isArray(source.oneOf)
      ? source.oneOf
      : undefined;
  if (union) {
    const branches = union.filter(
      (item) =>
        !(item && typeof item === "object" && (item as Record<string, unknown>).type === "null"),
    );
    if (branches.length !== union.length) target.nullable = true;
    if (branches.length === 1) Object.assign(target, convertSchema(branches[0]));
    else if (branches.length > 1) target.anyOf = branches.map(convertSchema);
  }
  return target as GeminiSchema;
}

export async function generateMovieCandidates(
  songTitle: string,
  artist: string,
  filters: Pick<RecommendationRequest, "decades" | "languages"> & { languageLabels?: string[] },
  count = TARGET_RECOMMENDATION_COUNT,
  rejectedTitles: string[] = [],
): Promise<RecommendationCandidate[]> {
  if (!Number.isInteger(count) || count < 1 || count > MAX_RECOMMENDATION_COUNT)
    throw new AppError("AI_SERVICE_ERROR", "Invalid candidate count.", 502);
  let output: unknown;
  try {
    output = await getGeminiClient().generateStructured(
      buildSongToCinemaPrompt(songTitle, artist, count, filters, rejectedTitles),
      convertSchema(z.toJSONSchema(GeminiRecommendationOutputSchema(count))),
      { temperature: 0.65, maxOutputTokens: 400 + count * 180 },
    );
  } catch (error) {
    if (error instanceof GeminiClientError && error.code === "RATE_LIMITED")
      throw new AppError(
        "RATE_LIMITED",
        "The recommendation service is busy. Please try again shortly.",
        429,
      );
    throw new AppError(
      "AI_SERVICE_ERROR",
      "We couldn't interpret that song right now. Please try again.",
      502,
    );
  }
  const parsed = GeminiRecommendationOutputSchema(count).safeParse(output);
  if (!parsed.success)
    throw new AppError(
      "AI_SERVICE_ERROR",
      "The recommendation service returned an invalid response. Please try again.",
      502,
    );
  const candidates: RecommendationCandidate[] = [];
  const seen = new Set<string>();
  for (const candidate of parsed.data.candidates) {
    const normalized = candidate.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const valid = RecommendationCandidateSchema.safeParse(candidate);
    if (valid.success) candidates.push(valid.data);
  }
  if (!candidates.length)
    throw new AppError(
      "AI_SERVICE_ERROR",
      "We couldn't find distinct films for this song. Please try again.",
      502,
    );
  return candidates;
}
