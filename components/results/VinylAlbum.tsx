"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { VerifiedMovie } from "@/types/movie";
import { cxModule } from "@/lib/utils";
import { MovieArtwork } from "./MovieArtwork";
import styles from "./vinyl.module.css";

interface VinylAlbumProps {
	movie: VerifiedMovie;
	index: number;
}

interface DragState {
	pointerId: number;
	startX: number;
	startYaw: number;
}

const className = (names: string) => cxModule(styles, names);

export function VinylAlbum({ movie, index }: VinylAlbumProps) {
	const [yaw, setYaw] = useState(22);
	const [dragging, setDragging] = useState(false);
	const drag = useRef<DragState | null>(null);
	const year = /^(\d{4})/.exec(movie.releaseDate)?.[1];
	const description = movie.overview.trim() || "No overview is available for this film.";

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
		drag.current = { pointerId: event.pointerId, startX: event.clientX, startYaw: yaw };
		if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
		if (!drag.current || drag.current.pointerId !== event.pointerId) return;
		const distance = event.clientX - drag.current.startX;
		if (!dragging && Math.abs(distance) > 4) {
			setDragging(true);
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		setYaw(drag.current.startYaw + distance * 0.4);
	}

	function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
		if (!drag.current || drag.current.pointerId !== event.pointerId) return;
		drag.current = null;
		setDragging(false);
	}

	return (
		<article className={className("vinyl-display")} style={{ animationDelay: `${index * 70}ms` }}>
			<div
				className={className(`stage${dragging ? " is-dragging" : ""}`)}
				role="group"
					aria-label={`${movie.title} 3D vinyl album. Front cover shows the movie poster; the back cover shows the movie description. Drag horizontally to rotate.`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onLostPointerCapture={handlePointerUp}
			>
				<div className={className("scene")}>
					<div className={className("album")} style={{ transform: `rotateY(${yaw}deg)`, transition: dragging ? "none" : undefined }}>
						<section className={className("sleeve-back")} aria-label={`${movie.title} album back cover`}>
							<div className={className("sleeve-back-content")}>
								<div className={className("sb-header")}>
									<div className={className("sb-artist")}>PITCHTOPICTURE · SONG TO CINEMA</div>
									<div className={className("sb-title")}>{movie.title}</div>
								</div>
								<p className={className("sb-description")}>{description}</p>
								<div className={className("sb-footer")}>
									<div className={className("sb-meta")}>
										<div>{year ? `${year} · ` : ""}FILM EDITION</div>
										<div>RATED {movie.rating > 0 ? `${movie.rating.toFixed(1)} / 10` : "NOT RATED"}</div>
										<div>PITCHTOPICTURE</div>
									</div>
									<div className={className("sb-barcode")} aria-hidden="true" />
								</div>
							</div>
						</section>

						<div className={className("record-holder")} aria-hidden="true">
							<div className={className("record-spin")}>
								<div className={className("record-back")}>
									<div className={className("record-grooves")} />
									<div className={className("record-label-back")} />
									<div className={className("record-hole")} />
								</div>
								<div className={className("record-face")}>
									<div className={className("record-grooves")} />
									<div className={className("record-label")}>
										<div className={className("label-ring")} />
									</div>
									<div className={className("record-hole")} />
								</div>
							</div>
							<div className={className("record-shine")} />
						</div>

						<section className={className("sleeve-front")} aria-label={`${movie.title} movie poster on album front`}>
							<div className={className("cover-art")}>
								<MovieArtwork title={movie.title} artworkPath={movie.posterPath} alt={`${movie.title} poster`} sizes="(max-width: 48rem) 78vw, 30vw" className={className("movie-poster")} />
								<div className={className("poster-rating")} aria-label={movie.rating > 0 ? `Rating ${movie.rating.toFixed(1)} out of 10` : "No rating available"}>
									{movie.rating > 0 ? `★ ${movie.rating.toFixed(1)}` : movie.title}
								</div>
								<div className={className("ca-gloss")} />
							</div>
						</section>

						<div className={className("spine")} aria-hidden="true">
							<div className={className("spine-content")}>
								<div className={className("spine-artist")}>PITCHTOPICTURE</div>
								<div className={className("spine-cat")}>{year ?? "FILM"}</div>
							</div>
						</div>
						<div className={className("edge edge-top")} aria-hidden="true" />
						<div className={className("edge edge-bottom")} aria-hidden="true" />
					</div>
				</div>
				<p className={className("vinyl-instruction")} aria-hidden="true">Drag to rotate · The record spins on its own</p>
			</div>
		</article>
	);
}
