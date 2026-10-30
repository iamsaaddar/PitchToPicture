"use client";

import { useEffect, useState } from "react";
import type { RecommendationResponse } from "@/types/recommendation";
import { VinylAlbum } from "./VinylAlbum";

interface ResultsExperienceProps {
  response: RecommendationResponse;
  songTitle: string;
  artist: string;
  onNewSearch: () => void;
}

export function ResultsExperience({
  response,
  songTitle,
  artist,
  onNewSearch,
}: ResultsExperienceProps) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= response.recommendations.length) return;
    const timer = window.setTimeout(() => setRevealed((count) => count + 1), 360);
    return () => window.clearTimeout(timer);
  }, [revealed, response.recommendations.length]);

  return (
    <section className="ptp-results" aria-labelledby="results-title">
      <div className="ptp-results-heading">
        <p className="ptp-eyebrow">
          <span /> YOUR SONG, REIMAGINED
        </p>
        <h2 id="results-title">
          A little cinema for <em>{songTitle}</em>
        </h2>
        <p className="ptp-results-byline">
          {artist} · {response.recommendations.length}{" "}
          {response.recommendations.length === 1 ? "film" : "films"} found
        </p>
      </div>
      <div className="ptp-case-grid">
        {response.recommendations.slice(0, revealed).map((item, index) => (
          <VinylAlbum key={item.movie.tmdbId} movie={item.movie} index={index} />
        ))}
      </div>
      {revealed < response.recommendations.length ? (
        <p className="ptp-reveal-status" role="status">
          Revealing your collection…
        </p>
      ) : (
        <p className="ptp-reveal-status">Every case is yours to explore.</p>
      )}
      <button className="ptp-reset" onClick={onNewSearch} type="button">
        ← Find films for another song
      </button>
      <p className="ptp-attribution">
        Movie data and artwork provided by TMDB. PitchToPicture is not endorsed or certified by
        TMDB.
      </p>
    </section>
  );
}
