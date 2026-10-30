import { z } from "zod";
import { VerifiedMovieSchema } from "@/schemas/movie";

export const MAX_SONG_TITLE_LENGTH = 160;
export const MAX_ARTIST_LENGTH = 120;
export const MIN_RECOMMENDATION_COUNT = 4;
export const TARGET_RECOMMENDATION_COUNT = 6;
export const MAX_RECOMMENDATION_COUNT = 7;
export const MOVIE_DECADES = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;

const MovieDecadeSchema = z
  .number()
  .int()
  .refine((decade) => MOVIE_DECADES.includes(decade as (typeof MOVIE_DECADES)[number]));

export const RecommendationRequestSchema = z
  .object({
    songTitle: z.string().trim().min(1).max(MAX_SONG_TITLE_LENGTH),
    artist: z.string().trim().min(1).max(MAX_ARTIST_LENGTH),
    decades: z
      .array(MovieDecadeSchema)
      .max(MOVIE_DECADES.length)
      .refine((values) => new Set(values).size === values.length),
    languages: z
      .array(z.string().regex(/^[a-z]{2,3}$/))
      .max(300)
      .refine((values) => new Set(values).size === values.length),
  })
  .strict();

export const RecommendationCandidateSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    year: z.number().int().min(1888).max(2200).nullable(),
  })
  .strict();

export const GeminiRecommendationOutputSchema = (count = TARGET_RECOMMENDATION_COUNT) =>
  z
    .object({
      candidates: z.array(RecommendationCandidateSchema).length(count),
    })
    .strict();

export const RecommendationResponseSchema = z
  .object({
    recommendations: z
      .array(
        z
          .object({
            movie: VerifiedMovieSchema,
          })
          .strict(),
      )
      .min(MIN_RECOMMENDATION_COUNT)
      .max(MAX_RECOMMENDATION_COUNT),
  })
  .strict();

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export type RecommendationCandidate = z.infer<typeof RecommendationCandidateSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
