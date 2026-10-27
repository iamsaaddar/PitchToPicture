export function buildSongToCinemaPrompt(songTitle: string, artist: string, count: number, rejectedTitle?: string) {
  return [
    "You connect music with cinema through emotional intuition.",
    `The user supplied song title: ${JSON.stringify(songTitle)}.`,
    `Artist: ${JSON.stringify(artist)}.`,
    "Interpret the song's perceived vibe, feelings, emotions, themes, and atmosphere from your available knowledge. You are not listening to audio, so do not claim to have analyzed the recording or its actual sound waves.",
    "Recommend movies that capture the song's emotional experience, not merely its genre or literal lyrical subject. Films can differ in genre or plot when their atmosphere, characters, or emotional aftertaste fit.",
    `Return exactly ${count} distinct real feature film${count === 1 ? "" : "s"}. For each, return title, release year if known (otherwise null), and one concise, specific, poetic explanation no longer than 360 characters.`,
    "Avoid generic, repetitive, fabricated, or duplicate film recommendations. Do not provide metadata, ratings, IDs, posters, links, or extra fields. Return JSON only.",
    rejectedTitle ? `The following candidate could not be confidently verified by TMDB. Return a different film, not this title: ${JSON.stringify(rejectedTitle)}.` : "",
  ].filter(Boolean).join("\n\n");
}
