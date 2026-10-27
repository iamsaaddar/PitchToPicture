"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ResultsExperience } from "@/components/results/ResultsExperience";
import type { RecommendationResponse } from "@/types/recommendation";

export default function Home() {
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<RecommendationResponse | null>(null);

  async function submitSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songTitle: songTitle.trim(), artist: artist.trim() }),
      });
      const data = (await response.json()) as RecommendationResponse | { error?: { message?: string } };
      if (!response.ok || !("recommendations" in data)) {
        throw new Error(("error" in data ? data.error?.message : undefined) || "We couldn't turn that song into cinema. Try again.");
      }
      setResults(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The recommendation service is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResults(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ptp-shell">
      <div className="ptp-atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <header className="ptp-header"><Link href="/" className="ptp-brand" aria-label="PitchToPicture home"><span className="ptp-brand-mark">P</span> PITCH<span>TO</span>PICTURE</Link><span className="ptp-header-note">SONG IN. CINEMA OUT.</span></header>

      <section className="ptp-hero" aria-labelledby="hero-title">
        <p className="ptp-eyebrow"><span /> A DIFFERENT WAY TO DISCOVER FILMS</p>
        <h1 id="hero-title">Some songs feel<br /><em>like a movie.</em></h1>
        <p className="ptp-intro">Give us the song you can’t quite explain. We’ll find the films that live in its emotional world.</p>

        <form className="ptp-song-form" onSubmit={submitSong}>
          <label htmlFor="song-title">SONG TITLE</label>
          <input id="song-title" name="songTitle" autoComplete="off" maxLength={160} required value={songTitle} onChange={(event) => setSongTitle(event.target.value)} placeholder="e.g. Space Song" disabled={loading} />
          <label htmlFor="song-artist">ARTIST</label>
          <input id="song-artist" name="artist" autoComplete="off" maxLength={120} required value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="e.g. Beach House" disabled={loading} />
          <button className="ptp-submit" type="submit" disabled={loading}>{loading ? <><span className="ptp-spinner" aria-hidden="true" /> Turning your song into cinema…</> : <>Find its films <span aria-hidden="true">↗</span></>}</button>
        </form>

        {loading ? <p className="ptp-status" role="status" aria-live="polite">Listening for the feeling between the notes<span className="ptp-ellipsis">…</span></p> : null}
        {error ? <p className="ptp-error" role="alert">{error}</p> : null}
      </section>

      {results ? <ResultsExperience response={results} songTitle={songTitle} artist={artist} onNewSearch={reset} /> : null}

      <footer className="ptp-footer"><span>MADE FOR THE FEELING, NOT THE GENRE.</span><span>GEMINI × TMDB</span></footer>
    </main>
  );
}
