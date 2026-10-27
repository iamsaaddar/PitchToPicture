import { z } from "zod";
import { VerifiedMovieSchema } from "@/schemas/movie";

export const MAX_SONG_TITLE_LENGTH = 160;
export const MAX_ARTIST_LENGTH = 120;
export const RECOMMENDATION_COUNT = 5;

export const RecommendationRequestSchema = z.object({
  songTitle: z.string().trim().min(1).max(MAX_SONG_TITLE_LENGTH),
  artist: z.string().trim().min(1).max(MAX_ARTIST_LENGTH),
}).strict();

export const RecommendationCandidateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  year: z.number().int().min(1888).max(2200).nullable(),
}).strict();

export const GeminiRecommendationOutputSchema = (count = RECOMMENDATION_COUNT) => z.object({
  candidates: z.array(RecommendationCandidateSchema).length(count),
}).strict();

export const RecommendationResponseSchema = z.object({
  recommendations: z.array(z.object({
    movie: VerifiedMovieSchema,
  }).strict()).min(1).max(RECOMMENDATION_COUNT),
}).strict();

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export type RecommendationCandidate = z.infer<typeof RecommendationCandidateSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
