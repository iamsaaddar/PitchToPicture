"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    const params = new URLSearchParams({ songTitle: songTitle.trim(), artist: artist.trim() });
    router.push(`/filters?${params.toString()}`);
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
          <button className="ptp-submit" type="submit" disabled={loading}>{loading ? <>Opening your listening room…</> : <>Choose your cinema <span aria-hidden="true">↗</span></>}</button>
        </form>

        {loading ? <p className="ptp-status" role="status" aria-live="polite">Setting the scene<span className="ptp-ellipsis">…</span></p> : null}
      </section>

      <footer className="ptp-footer"><span>MADE FOR THE FEELING, NOT THE GENRE.</span><span>GEMINI × TMDB</span></footer>
    </main>
  );
}
