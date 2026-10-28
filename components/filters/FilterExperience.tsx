"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ResultsExperience } from "@/components/results/ResultsExperience";
import { MOVIE_DECADES } from "@/schemas/recommendations";
import type { RecommendationResponse } from "@/types/recommendation";

interface LanguageOption { iso639_1: string; english_name: string; name: string }

const EXCLUDED_LANGUAGE_CODES = new Set(["ur", "pa", "pt", "bn", "ta", "zh"]);
const POPULAR_LANGUAGE_CODES = ["en", "hi", "es", "fr", "ja", "ko", "de", "ru", "ar", "it"];

// Keep the selector usable if TMDB's language configuration endpoint is unavailable.
const FALLBACK_LANGUAGES: LanguageOption[] = [
  { iso639_1: "en", english_name: "English", name: "English" },
  { iso639_1: "hi", english_name: "Hindi", name: "हिन्दी" },
  { iso639_1: "es", english_name: "Spanish", name: "Español" },
  { iso639_1: "fr", english_name: "French", name: "Français" },
  { iso639_1: "ja", english_name: "Japanese", name: "日本語" },
  { iso639_1: "ko", english_name: "Korean", name: "한국어" },
  { iso639_1: "zh", english_name: "Chinese", name: "中文" },
  { iso639_1: "it", english_name: "Italian", name: "Italiano" },
  { iso639_1: "de", english_name: "German", name: "Deutsch" },
  { iso639_1: "ru", english_name: "Russian", name: "Русский" },
  { iso639_1: "ar", english_name: "Arabic", name: "العربية" },
  { iso639_1: "te", english_name: "Telugu", name: "తెలుగు" },
  { iso639_1: "ml", english_name: "Malayalam", name: "മലയാളം" },
  { iso639_1: "tr", english_name: "Turkish", name: "Türkçe" },
  { iso639_1: "id", english_name: "Indonesian", name: "Bahasa Indonesia" },
  { iso639_1: "th", english_name: "Thai", name: "ไทย" },
  { iso639_1: "vi", english_name: "Vietnamese", name: "Tiếng Việt" },
  { iso639_1: "pl", english_name: "Polish", name: "Polski" },
  { iso639_1: "nl", english_name: "Dutch", name: "Nederlands" },
];

export function FilterExperience({ songTitle, artist }: { songTitle: string; artist: string }) {
  const [decades, setDecades] = useState<number[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [languageSearch, setLanguageSearch] = useState("");
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/tmdb/languages")
      .then(async (response) => {
        const data = await response.json() as { languages?: LanguageOption[]; error?: { message?: string } };
        if (!response.ok || !Array.isArray(data.languages) || data.languages.length === 0) {
          throw new Error(data.error?.message || "TMDB returned an empty language list.");
        }
        if (active) setLanguageOptions(data.languages);
      })
      .catch(() => {
        if (active) setLanguageOptions(FALLBACK_LANGUAGES);
      })
      .finally(() => { if (active) setLoadingLanguages(false); });
    return () => { active = false; };
  }, []);

  const orderedLanguages = useMemo(() => {
    const availableLanguages = languageOptions.filter((language) => !EXCLUDED_LANGUAGE_CODES.has(language.iso639_1));
    const popular = POPULAR_LANGUAGE_CODES.map((code) => availableLanguages.find((language) => language.iso639_1 === code)).filter((language): language is LanguageOption => Boolean(language));
    const query = languageSearch.trim().toLocaleLowerCase();
    const searchResults = query
      ? availableLanguages.filter((language) => `${language.english_name} ${language.name} ${language.iso639_1}`.toLocaleLowerCase().includes(query))
      : [];
    return { popular, searchResults, availableCount: availableLanguages.length };
  }, [languageOptions, languageSearch]);

  function toggleDecade(decade: number) {
    setDecades((selected) => selected.includes(decade) ? selected.filter((item) => item !== decade) : [...selected, decade].sort((a, b) => a - b));
  }

  function toggleLanguage(code: string) {
    setLanguages((selected) => selected.includes(code) ? selected.filter((item) => item !== code) : [...selected, code]);
  }

  async function findFilms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !songTitle || !artist) return;
    setLoading(true);
    setTransitioning(true);
    setError("");
    setResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1250));
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songTitle, artist, decades, languages }),
      });
      const data = await response.json() as RecommendationResponse | { error?: { message?: string } };
      if (!response.ok || !("recommendations" in data)) throw new Error(("error" in data ? data.error?.message : undefined) || "We couldn't find matching films. Please try again.");
      setResults(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The recommendation service is unavailable. Please try again.");
    } finally {
      setLoading(false);
      setTransitioning(false);
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
      <header className="ptp-header"><Link href="/" className="ptp-brand" aria-label="PitchToPicture home"><span className="ptp-brand-mark">P</span> PITCH<span>TO</span>PICTURE</Link><span className="ptp-header-note">SIDE A · YOUR CINEMATIC SETTINGS</span></header>

      {!results && !transitioning ? <section className="ptp-filter-page" aria-labelledby="filters-title">
        <div className="ptp-soundwave" aria-hidden="true">{Array.from({ length: 47 }, (_, index) => <i key={index} style={{ "--bar": `${8 + ((index * 17 + index % 5 * 11) % 25)}px`, "--delay": `${(index % 13) * -0.11}s` } as React.CSSProperties} />)}</div>
        <p className="ptp-eyebrow"><span /> THE VINYL TIME MACHINE</p>
        <h1 id="filters-title">Set the scene.<br /><em>Keep the feeling.</em></h1>
        <p className="ptp-filter-subtitle">Tune the era and language. Your song takes care of the emotion.</p>
        <div className="ptp-now-playing"><span className="ptp-record-icon ptp-record-spinning" aria-hidden="true"><i /></span><div><span className="ptp-filter-overline"><span className="ptp-live-dot" /> NOW PLAYING</span><strong>{songTitle || "Unknown song"}</strong><span>{artist || "Unknown artist"}</span></div><Link href="/" className="ptp-edit-song">Change track ↗</Link></div>

        <form className="ptp-filter-form" onSubmit={findFilms}>
          <section className="ptp-filter-section" aria-labelledby="decades-title">
            <div className="ptp-filter-heading"><span className="ptp-filter-index">01 / ERA</span><div><h2 id="decades-title">Drop the needle on a decade</h2><p>Each era has its own kind of movie magic.</p></div><span className="ptp-selection-count">{decades.length ? `${decades.length} SELECTED` : "OPEN TIMELINE"}</span></div>
            <div className="ptp-era-timeline" aria-label="Choose movie decades">
              <div className="ptp-era-track" aria-hidden="true"><span className="ptp-era-track-fill" style={{ left: "0%", width: `${(MOVIE_DECADES.length - 1) ? (Math.max(0, ...decades.map((decade) => MOVIE_DECADES.indexOf(decade as typeof MOVIE_DECADES[number]))) / (MOVIE_DECADES.length - 1)) * 100 : 0}%` }} /></div>
              {MOVIE_DECADES.map((decade, index) => {
                const selected = decades.includes(decade);
                return <button key={decade} type="button" className={`ptp-era-point${selected ? " is-selected" : ""}`} style={{ "--era-position": `${(index / (MOVIE_DECADES.length - 1)) * 100}%` } as React.CSSProperties} onClick={() => toggleDecade(decade)} aria-pressed={selected} aria-label={`${decade}s, films released between ${decade} and ${decade + 9}`}><span className="ptp-era-node"><i /></span><strong>{String(decade).slice(2)}s</strong></button>;
              })}
            </div>
            <div className="ptp-era-detail" aria-live="polite"><span className="ptp-era-detail-kicker">{decades.length ? "YOUR SELECTED DECADES" : "THE WHOLE RECORD COLLECTION"}</span><strong>{decades.length ? decades.map((decade) => `${decade}s`).join(" · ") : "Any decade"}</strong><p>{decades.length ? `Films released in ${decades.map((decade) => `${decade}–${decade + 9}`).join(" and ")} only. Unselected decades are excluded.` : "From classic cinema to whatever comes next. Let the song lead."}</p></div>
            <button type="button" className={`ptp-any-option ptp-any-era${decades.length === 0 ? " is-selected" : ""}`} onClick={() => setDecades([])} aria-pressed={decades.length === 0}><span className="ptp-any-vinyl" aria-hidden="true">◉</span><span><strong>Any decade</strong><small>Let the feeling choose the era</small></span><span className="ptp-option-state">{decades.length === 0 ? "SELECTED ✓" : "CLEAR SELECTION"}</span></button>
          </section>

          <section className="ptp-filter-section" aria-labelledby="languages-title">
            <div className="ptp-filter-heading"><span className="ptp-filter-index">02 / MIXER</span><div><h2 id="languages-title">The Soundboard</h2><p>Bring each language into the mix. Layer the voices of world cinema.</p></div><span className="ptp-selection-count">{languages.length ? `${languages.length} ACTIVE` : "MIXER READY"}</span></div>
            {loadingLanguages ? <p className="ptp-filter-help">Tuning into the world&apos;s cinema…</p> : null}
            {!loadingLanguages ? <div className="ptp-language-search"><span aria-hidden="true">⌕</span><input type="search" value={languageSearch} onChange={(event) => setLanguageSearch(event.target.value)} placeholder="Search languages or codes…" aria-label="Search movie languages" /><span className="ptp-language-count">{languageSearch.trim() ? `${orderedLanguages.searchResults.length} found` : `${orderedLanguages.availableCount} available`}</span></div> : null}
            {!loadingLanguages ? <div className={`ptp-soundboard${languageSearch.trim() ? " is-searching" : ""}`} aria-label={languageSearch.trim() ? "Language channel search results" : "Popular language channels"}>
              <div className="ptp-soundboard-channels">
              {(languageSearch.trim() ? orderedLanguages.searchResults : orderedLanguages.popular).map((language, index) => {
                const selected = languages.includes(language.iso639_1);
                return <button key={language.iso639_1} type="button" className={`ptp-soundboard-channel${selected ? " is-active" : ""}`} style={{ "--channel-index": index } as React.CSSProperties} onClick={() => toggleLanguage(language.iso639_1)} aria-pressed={selected} aria-label={`${language.english_name}${selected ? ", active channel" : ", activate channel"}`}>
                  <span className="ptp-channel-topline"><i className="ptp-channel-led"/><span>{language.english_name}</span></span>
                  <span className="ptp-level-meter" aria-hidden="true"><i style={{ "--frequency-height": `${30 + ((index * 19 + index % 4 * 13) % 78)}px`, "--meter-delay": `${(index % 9) * -0.09}s` } as React.CSSProperties} /></span>
                  <small>{language.iso639_1.toUpperCase()}</small>
                </button>;
              })}
              {!languageSearch.trim() && !orderedLanguages.popular.length ? <p className="ptp-filter-help">Popular channels are unavailable. Search for a language to add it to the mix.</p> : null}
              {languageSearch.trim() && !orderedLanguages.searchResults.length ? <p className="ptp-filter-help">No languages match “{languageSearch}”. Try another spelling.</p> : null}
              </div>
            </div> : null}
            <div className="ptp-any-language-wrap"><button type="button" className={`ptp-any-language${languages.length === 0 ? " is-selected" : ""}`} onClick={() => setLanguages([])} aria-pressed={languages.length === 0}><span aria-hidden="true">♫</span><strong>Any language</strong></button></div>
          </section>

          {error ? <p className="ptp-error" role="alert">{error}</p> : null}
          <div className="ptp-filter-footer"><p><span className="ptp-footer-star">✳</span> Your filters set the scene.<br />Your song sets the feeling.</p><button className="ptp-submit ptp-find-films" type="submit" disabled={loading || loadingLanguages || !songTitle || !artist}><span className="ptp-button-vinyl" aria-hidden="true"><i /></span><span>Find my films <small>{decades.length || languages.length ? "YOUR CUSTOM CUT" : "LET THE SONG DECIDE"}</small></span><span className="ptp-submit-arrow" aria-hidden="true">↗</span></button></div>
        </form>
      </section> : null}

      {transitioning ? <section className="ptp-cinema-transition" role="status" aria-live="polite" aria-label="Finding your films"><div className="ptp-transition-orbit"><div className="ptp-transition-record"><span /></div><div className="ptp-transition-ring" /><div className="ptp-transition-ring ptp-transition-ring-two" /></div><p className="ptp-eyebrow"><span /> SIDE B · IN THE MAKING</p><h2>Your song is becoming <em>cinema.</em></h2><p className="ptp-transition-copy">Matching the feeling. Finding the frames.</p><div className="ptp-transition-wave" aria-hidden="true">{Array.from({ length: 31 }, (_, index) => <i key={index} style={{ "--bar": `${8 + ((index * 11) % 26)}px`, "--delay": `${(index % 9) * -0.13}s` } as React.CSSProperties} />)}</div></section> : null}
      {results ? <ResultsExperience response={results} songTitle={songTitle} artist={artist} onNewSearch={reset} /> : null}

      <footer className="ptp-footer"><span>MADE FOR THE FEELING, NOT THE GENRE.</span><span>GEMINI × TMDB</span></footer>
    </main>
  );
}
