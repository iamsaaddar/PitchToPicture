import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { RecommendationRequestSchema, RecommendationResponseSchema } from "@/schemas/recommendations";
import { generateMovieCandidates } from "@/services/gemini/recommendations";
import { verifyMovieCandidate } from "@/services/tmdb/verify";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";

export async function generateRecommendationResponse(request: RecommendationRequest): Promise<RecommendationResponse> {
  const parsedRequest = RecommendationRequestSchema.safeParse(request);
  if (!parsedRequest.success) throw new AppError("INVALID_REQUEST", "Enter both a song title and artist.", 400);
  const { songTitle, artist } = parsedRequest.data;
  const candidates = await generateMovieCandidates(songTitle, artist);
  const recommendations: RecommendationResponse["recommendations"] = [];
  const acceptedIds = new Set<number>();

  for (const candidate of candidates) {
    let verified = null;
    try {
      verified = await verifyMovieCandidate(candidate);
    } catch (error) {
      if (error instanceof AppError && error.code === "RATE_LIMITED") throw error;
      logger.warn("TMDB could not verify a suggested film", { category: "CANDIDATE_VERIFICATION_FAILED" });
    }

    if (!verified || acceptedIds.has(verified.tmdbId)) {
      try {
        const [replacement] = await generateMovieCandidates(songTitle, artist, 1, candidate.title);
        if (replacement) {
          verified = await verifyMovieCandidate(replacement);
        }
      } catch (error) {
        if (error instanceof AppError && error.code === "RATE_LIMITED") throw error;
        logger.warn("The single replacement attempt did not produce a verified film", { category: "REPLACEMENT_FAILED" });
        verified = null;
      }
    }

    if (!verified || acceptedIds.has(verified.tmdbId)) continue;
    acceptedIds.add(verified.tmdbId);
    recommendations.push({ movie: verified });
  }

  if (!recommendations.length) throw new AppError("INSUFFICIENT_RESULTS", "We couldn't verify any movie recommendations for that song. Try another song or artist.", 422);
  const response = RecommendationResponseSchema.safeParse({ recommendations });
  if (!response.success) throw new AppError("AI_SERVICE_ERROR", "The recommendation service returned an invalid result.", 502);
  return response.data;
}
