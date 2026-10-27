import { z } from "zod";
import {
	MAX_MOVIE_IMAGE_PATH_LENGTH,
	MAX_MOVIE_OVERVIEW_LENGTH,
	MAX_MOVIE_RELEASE_DATE_LENGTH,
	MAX_MOVIE_TITLE_LENGTH,
} from "@/constants/limits";

const movieText = (max: number) => z.string().trim().min(1).max(max);

export const VerifiedMovieSchema = z.object({
	tmdbId: z.number().int().positive(),

	title: movieText(MAX_MOVIE_TITLE_LENGTH),

	releaseDate: z.string().max(MAX_MOVIE_RELEASE_DATE_LENGTH),

	overview: z.string().max(MAX_MOVIE_OVERVIEW_LENGTH),

	posterPath: z.string().max(MAX_MOVIE_IMAGE_PATH_LENGTH).nullable(),
	rating: z.number().min(0).max(10),
}).strict();
