import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { MIN_RECOMMENDATION_COUNT, TARGET_RECOMMENDATION_COUNT, MAX_RECOMMENDATION_COUNT, RecommendationRequestSchema, RecommendationResponseSchema } from "@/schemas/recommendations";
import { generateMovieCandidates } from "@/services/gemini/recommendations";
import { verifyMovieCandidate } from "@/services/tmdb/verify";
import { getTmdbLanguages } from "@/services/tmdb/languages";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";

export async function generateRecommendationResponse(request: RecommendationRequest): Promise<RecommendationResponse> {
  const parsedRequest = RecommendationRequestSchema.safeParse(request);
  if (!parsedRequest.success) throw new AppError("INVALID_REQUEST", "Enter both a song title and artist.", 400);
  const { songTitle, artist, decades, languages } = parsedRequest.data;
  const availableLanguages = languages.length ? await getTmdbLanguages() : [];
  const filters = {
    decades,
    languages,
    languageLabels: languages.map((code) => availableLanguages.find((language) => language.iso639_1 === code)?.english_name ?? code),
  };
  const candidates = await generateMovieCandidates(songTitle, artist, filters, MAX_RECOMMENDATION_COUNT);
  const recommendations: RecommendationResponse["recommendations"] = [];
  const acceptedIds = new Set<number>();
  const rejectedTitles = new Set<string>();
  let replacementAttempts = 0;
  const maxReplacementAttempts = 14;

  async function tryCandidate(candidate: (typeof candidates)[number]) {
    let verified = null;
    try {
      verified = await verifyMovieCandidate(candidate, filters);
    } catch (error) {
      if (error instanceof AppError && error.code === "RATE_LIMITED") throw error;
      logger.warn("TMDB could not verify a suggested film", { category: "CANDIDATE_VERIFICATION_FAILED" });
    }

    if (!verified || acceptedIds.has(verified.tmdbId)) {
      rejectedTitles.add(candidate.title);
      return false;
    }
    acceptedIds.add(verified.tmdbId);
    recommendations.push({ movie: verified });
    return true;
  }

  for (const candidate of candidates) {
    if (recommendations.length >= MAX_RECOMMENDATION_COUNT) break;
    await tryCandidate(candidate);
  }

  while (recommendations.length < TARGET_RECOMMENDATION_COUNT && recommendations.length < MAX_RECOMMENDATION_COUNT && replacementAttempts < maxReplacementAttempts) {
    replacementAttempts += 1;
    try {
      const [replacement] = await generateMovieCandidates(songTitle, artist, filters, 1, [...rejectedTitles].slice(-12));
      if (!replacement) break;
      rejectedTitles.add(replacement.title);
      await tryCandidate(replacement);
    } catch (error) {
      if (error instanceof AppError && error.code === "RATE_LIMITED") throw error;
      logger.warn("A replacement candidate could not be generated or verified", { category: "REPLACEMENT_FAILED", attempt: replacementAttempts });
      if (error instanceof AppError && error.code === "AI_SERVICE_ERROR") break;
    }
  }

  if (recommendations.length < MIN_RECOMMENDATION_COUNT) {
    throw new AppError("INSUFFICIENT_RESULTS", `We could verify only ${recommendations.length} films that match your filters. Try selecting more decades or languages.`, 422);
  }
  const response = RecommendationResponseSchema.safeParse({ recommendations });
  if (!response.success) throw new AppError("AI_SERVICE_ERROR", "The recommendation service returned an invalid result.", 502);
  return response.data;
}
