"use client";

import type { VerifiedMovie } from "@/types/movie";
import { VinylAlbum } from "./VinylAlbum";

interface MovieCardProps {
	movie: VerifiedMovie;
	index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
	return (
		<VinylAlbum movie={movie} index={index} />
	);
}
