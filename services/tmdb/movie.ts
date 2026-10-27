import { fetchTmdb } from "./client";

export interface TmdbMovieDetails {
	id: number;
	title: string;
	releaseDate: string;
	overview: string;
	posterPath: string | null;
	rating: number;
}

export async function getMovieById(
	tmdbId: number,
): Promise<TmdbMovieDetails> {
	const response = await fetchTmdb<{
		id?: number;
		title?: string;
		release_date?: string | null;
		overview?: string | null;
		poster_path?: string | null;
		vote_average?: number;
	}>(`/movie/${tmdbId}`);

	if (typeof response.id !== "number") {
		throw new Error("TMDB details response did not include a valid movie ID.");
	}

	return {
		id: response.id,
		title: typeof response.title === "string" ? response.title : "",
		releaseDate:
			typeof response.release_date === "string" ? response.release_date : "",
		overview: typeof response.overview === "string" ? response.overview : "",
		posterPath:
			typeof response.poster_path === "string" ? response.poster_path : null,
		rating: typeof response.vote_average === "number" ? response.vote_average : 0,
	};
}
