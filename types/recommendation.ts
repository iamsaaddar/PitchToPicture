import type { z } from "zod";
import {
  RecommendationRequestSchema,
  RecommendationResponseSchema,
} from "@/schemas/recommendations";

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
