export function buildSongToCinemaPrompt(
  songTitle: string,
  artist: string,
  count: number,
  filters: { decades: number[]; languages: string[]; languageLabels?: string[] },
  rejectedTitles: string[] = [],
) {
  const decadeConstraint = filters.decades.length
    ? filters.decades.map((decade) => `${decade}s (${decade}-${decade + 9})`).join(", ")
    : "Any decade from the 1940s through the 2020s";
  const languageConstraint = filters.languages.length
    ? filters.languages.map((code, index) => `${filters.languageLabels?.[index] ?? code} (${code})`).join(", ")
    : "Any original language";
  return [
    "You are a discerning music-informed film curator. Your task is to translate a song's emotional experience into cinema, not to match keywords.",
    `The user supplied song title: ${JSON.stringify(songTitle)}.`,
    `Artist: ${JSON.stringify(artist)}.`,
    `USER FILTERS (STRICT): Allowed release decades: ${decadeConstraint}. Allowed original-language TMDB codes: ${filters.languages.length ? languageConstraint : "any language"}. Only recommend films that satisfy both selected filters. If a filter is unrestricted, do not constrain that dimension. Do not invent or guess language codes.`,
    "WORK THROUGH THESE DECISIONS IN ORDER. Keep this analysis internal; do not include explanations in the response.",
    "1. GROUNDED SONG INTERPRETATION: Use reliable knowledge associated with this exact song and artist. You are not listening to live audio and must not claim to analyze the recording directly. Do not invent the song's key, tempo, instruments, production details, lyrics, or vocal delivery. Treat uncertain musical details as unknown; use cautious interpretation rather than presenting guesses as facts. Do not confuse this song with another track, cover, or artist.",
    "2. BUILD AN EMOTIONAL FINGERPRINT: Before choosing films, identify the song's dominant feeling, secondary emotions, emotional tension or contradiction, overall atmosphere, and lingering emotional impression. Be specific: distinguish, for example, yearning from heartbreak, wistfulness from despair, and intimacy from simple romance. Do not assume a song's mood from its title, genre, or subject alone.",
    "3. TRANSLATE THE FEELING INTO CINEMA: Choose films that could evoke a similar emotional experience through their mood, relationships, character journeys, pacing, imagery, atmosphere, and emotional aftertaste. The film's plot and genre do not need to resemble the lyrics. A film about the same topic is not automatically a good match; prioritize how the film feels.",
    `4. COMPARE CANDIDATES: Where practical, privately consider a broader pool of plausible films (at least about ${Math.max(count * 2, count + 3)} candidates) before selecting the final ${count}. Compare candidates against the emotional fingerprint and keep only the strongest fits. Do not simply return the first plausible titles that come to mind.`,
    "5. BALANCE VARIETY WITH FIT: Prefer films that express different facets of the same emotional fingerprint, such as intimacy, nostalgia, yearning, or emotional release. Avoid near-interchangeable choices and familiar titles chosen only because they are popular. Do not force variety when several films genuinely capture the song exceptionally well; emotional accuracy comes first.",
    "6. FACT-CHECK AND FINALIZE: Recommend real feature films, not TV episodes, series, shorts, hypothetical films, or invented titles. Use the correct recognizable film title and release year when known; use null for an uncertain year rather than guessing. Avoid duplicates and alternate-title duplicates. Never sacrifice a strong emotional match just to match the song's genre, lyrics, or popularity. The release year and original language must fit the strict user filters.",
    `Return exactly ${count} distinct real feature film${count === 1 ? "" : "s"} in the existing structured format. For each, return only the title and release year if known (otherwise null).`,
    "Do not provide the emotional fingerprint, chain of thought, rationales, metadata, ratings, IDs, posters, links, or extra fields. Return only the requested structured data; no prose.",
    rejectedTitles.length ? `These candidates have already failed TMDB verification, duplicated another film, or violated the selected filters. Do not recommend any of them again: ${JSON.stringify(rejectedTitles)}. Preserve all user filters exactly.` : "",
  ].filter(Boolean).join("\n\n");
}
