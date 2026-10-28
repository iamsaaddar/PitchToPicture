import "server-only";

import { fetchTmdb } from "./client";

export interface TmdbLanguage {
  iso639_1: string;
  english_name: string;
  name: string;
}

interface TmdbLanguageResponse {
  iso_639_1?: string;
  iso639_1?: string;
  english_name?: string;
  name?: string;
}

let cachedLanguages: TmdbLanguage[] | null = null;
let cachedAt = 0;

export async function getTmdbLanguages(): Promise<TmdbLanguage[]> {
  if (cachedLanguages && Date.now() - cachedAt < 6 * 60 * 60 * 1000) return cachedLanguages;

  const response = await fetchTmdb<TmdbLanguageResponse[]>("/configuration/languages");
  if (!Array.isArray(response)) return [];

  cachedLanguages = response
    .map((language) => ({
      iso639_1: language.iso_639_1 || language.iso639_1 || "",
      english_name: language.english_name || language.name || "",
      name: language.name || language.english_name || "",
    }))
    .filter((language) => /^[a-z]{2,3}$/.test(language.iso639_1) && Boolean(language.english_name))
    .sort((left, right) => left.english_name.localeCompare(right.english_name));
  cachedAt = Date.now();
  return cachedLanguages;
}
