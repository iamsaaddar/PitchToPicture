# PitchToPicture

**Turn your song into cinema.** PitchToPicture recommends up to five verified films that capture the emotional world of a song, rather than matching only its genre or literal subject.

The V1 experience is intentionally focused: enter a song title and artist, let Gemini interpret the song from its available knowledge, verify proposed film identities through TMDB, and explore the results in interactive 3D DVD cases.

> PitchToPicture does not listen to the song or analyze its actual audio. Its interpretation is based on the supplied title and artist and the AI model's available knowledge.

## How it works

1. Enter a song title and artist.
2. Gemini proposes five distinct films with short, poetic emotional-match explanations.
3. TMDB verifies movie identities and supplies canonical titles, release dates, posters, and supported metadata.
4. If a candidate cannot be confidently verified, the service asks Gemini for one replacement for that candidate and verifies it once.
5. Verified DVD cases reveal one at a time. All returned cases remain available for browsing and interaction.

Only confidently verified films are displayed. If provider failures prevent verification, the app returns a clear error or a smaller set of verified results rather than inventing film data.

## Stack

- Next.js App Router, React, and TypeScript
- Gemini API for song-to-cinema interpretation and candidate generation
- TMDB API for movie identity verification and metadata
- Zod for request and response validation
- Node's built-in test runner and ESLint
- CSS 3D transforms for the interactive DVD cases

## Run locally

Requirements: Node.js compatible with the installed Next.js version and npm.

```bash
npm install
```

Copy `.env.example` to `.env.local` and add your server-side API credentials:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
TMDB_API_KEY=your_tmdb_api_key
```

Never commit `.env.local`, expose credentials through `NEXT_PUBLIC_` variables, or include real keys in logs or screenshots.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The project should also be tested in a browser at mobile, tablet, and desktop sizes. In particular, confirm vertical page scrolling remains natural around the draggable DVD cases and that reduced-motion preferences are respected.

## Project structure

```text
app/                         Landing experience and API routes
components/results/          Reusable 3D DVD case and results reveal
services/gemini/             Server-side Gemini client and song prompt
services/tmdb/               TMDB search, movie details, and identity verification
services/recommendations/    Bounded Gemini-to-TMDB orchestration
schemas/                     Runtime request, response, and movie validation
types/                       Inferred TypeScript domain types
lib/                         Environment, errors, logging, and utilities
Pitch-To-Picture-roadmap.md   Product scope and implementation roadmap
```

## V1 boundaries

- No database, accounts, subscriptions, saved history, or separate music metadata provider.
- No audio upload, playback analysis, beat detection, or audio-feature extraction.
- Gemini interprets the song; the application does not add a separate musicology engine or emotional scoring pipeline.
- TMDB is the source of truth for movie identity and displayed movie metadata. TMDB does not validate whether a film is an emotional match.
- The accent color and exact animation timings remain open design decisions in the roadmap.
- Provider availability, quotas, terms, and hosting limits must be checked before release. A free-first goal is not a promise of unlimited free production use.

## Attribution

PitchToPicture uses the [TMDB API](https://www.themoviedb.org/documentation/api) and movie artwork supplied by [The Movie Database (TMDB)](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB. Follow TMDB's current attribution and API terms before public release.

Gemini is provided by [Google AI](https://ai.google.dev/). Access, model availability, limits, and terms may change; verify them before deployment.
