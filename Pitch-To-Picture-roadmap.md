# PitchToPicture — Project Roadmap

**Status:** V1 foundation implemented; roadmap work in progress  
**Product:** AI-powered song-to-movie discovery  
**Repository:** Independent project, separate from MediaPulse  
**V1 principle:** Keep the experience focused. Gemini interprets the song and proposes films; TMDB verifies movie identity and supplies canonical movie data.

> This roadmap records the agreed product scope and planned milestones. Existing code does not mean a phase is complete: mark work complete only after its acceptance criteria have been verified. Provider free-tier limits and terms still require current verification.

---

## 1. Product vision

PitchToPicture takes a song title and artist and recommends **five movies that capture the song's emotional world**.

The goal is not to match only the song's genre or literal lyrics. Gemini should consider its perceived vibe, feelings, emotions, atmosphere, and themes, then suggest films that feel like a natural cinematic counterpart.

For example, a dreamy, melancholic song might inspire a bittersweet romance, an introspective drama, or an atmospheric science-fiction film. The movie does not need to share the song's literal subject matter if its emotional experience is a strong match.

### V1 experience

1. The user enters a song title.
2. The user enters the artist name.
3. The user starts the search.
4. A dark, atmospheric loading transition appears with the text **“Turning your song into cinema…”**
5. Gemini receives the song title and artist and generates five movie recommendations based on the song's vibe, feelings, emotions, and atmosphere.
6. TMDB searches for and verifies each proposed movie, then supplies canonical titles, release years, IDs, posters, and other supported metadata.
7. Unverified candidates receive one replacement attempt from Gemini.
8. Verified movie cases reveal one at a time with brief animations.
9. After the reveal, all available cases remain accessible for browsing and interaction.

### Core product principles

- **Emotion over genre:** prioritize the song's emotional experience over broad genre labels or literal lyrical subject.
- **Gemini handles creative judgment:** do not build a separate musicology engine, custom emotional scoring pipeline, or elaborate ranking system for V1.
- **TMDB is the movie-data source of truth:** Gemini proposes movies; TMDB confirms their identities and provides movie metadata. TMDB does not verify the emotional quality of a match.
- **Be honest about song analysis:** V1 does not listen to audio or calculate audio features. Gemini interprets the supplied title and artist using its available knowledge. Do not claim the app has analyzed the actual audio.
- **Free-first:** prefer free and open-source options, but verify current service limits and terms before relying on them.
- **Independent project:** PitchToPicture has its own repository, history, configuration, documentation, and visual identity.
- **Mobile-first quality:** movie cases must not block scrolling or make the interface difficult to use on touchscreens.
- **Avoid needless complexity:** no database, user accounts, subscriptions, dedicated music metadata provider, or paid audio-analysis service is required for the initial version.

---

## 2. Decisions agreed so far

### Product behavior

- Song input uses **two separate fields**: song title and artist.
- Gemini generates **exactly five movie candidates**.
- Gemini is responsible for interpreting the song and selecting movies. Do not insert a separate music-analysis subsystem between input and recommendation generation.
- Every recommendation includes a short, poetic explanation of why the film matches the song's emotional world.
- TMDB verifies movie identities and provides canonical metadata and posters.
- If a candidate cannot be confidently verified through TMDB, ask Gemini for **one replacement** for that candidate.
- If the replacement also fails verification, show the remaining verified recommendations rather than retrying indefinitely or substituting an unrelated film.
- The results experience reveals movie cases one at a time, with a brief animation.
- When the reveal ends, all verified cases remain available for scrolling and interaction.
- On mobile, use **one case per row**. On desktop, use a cinematic multi-column layout.
- Reuse MediaPulse's existing 3D DVD case implementation, including the existing backside and movie-description presentation. Inspect the actual source implementation before adapting it; do not recreate it from memory or redesign the backside without agreement.

### Visual direction

- **Overall mood:** minimal, dark, atmospheric, intimate, cinematic.
- **Background:** near-black and midnight blue with faint moving haze, soft pools of light, and subtle film grain.
- **Music-inspired motion:** restrained waveform movement, gentle pulses or ripples, and brief reveal animations.
- **Typography:** an elegant display style paired with a clear, readable sans-serif for interface text.
- **Layout:** generous negative space, minimal borders, limited decoration, and movie artwork as the main source of color.
- **Performance and accessibility:** keep animations lightweight, avoid scroll-blocking interactions, respect reduced-motion preferences, and never communicate essential information through animation alone.
- **Accent color:** still to be finalized. Muted lavender has been recommended but is not yet locked in.
- **Exact fonts, spacing, and animation timings:** still to be finalized during UI planning.

The waveform is decorative in V1. Unless a future version actually analyzes or plays audio, it must not pretend to react to the song's real beat.

---

## 3. Proposed technology and architecture

The initial stack is expected to use:

- **Next.js, React, and TypeScript** for the application.
- **Gemini API** for song interpretation and movie recommendations.
- **TMDB API** for movie identity verification and canonical movie metadata.
- **CSS Modules and global CSS** for the current implementation; Tailwind is not required for the agreed V1 interface.
- **Zod** or an equivalent schema-validation approach for request validation and Gemini output.
- **A compatible test runner** for unit and integration tests, plus browser-level testing where useful.
- **Git and GitHub** for version control and public project documentation.
- **A suitable deployment provider** selected after checking current free-tier limits and server-side API support.

These are proposed choices, not evidence of an existing implementation. Confirm compatibility and current provider conditions before finalizing them.

### Simplified request flow

```text
Song title + artist
        |
        v
Validate input
        |
        v
Server-side Gemini request
  - interpret the song's perceived vibe and emotions
  - recommend exactly five movies
  - provide a concise emotional match explanation
        |
        v
Validate Gemini's structured response
        |
        v
Search TMDB for each candidate
        |
        v
Confidently verify movie identity
        |
        +---- Verified ------> Use TMDB metadata and poster
        |
        +---- Not verified --> Ask Gemini for one replacement
                                   |
                                   v
                             Verify replacement
                                   |
                                   v
                         Keep only verified movies
        |
        v
Return verified results (up to five)
        |
        v
Reveal the DVD cases one at a time
        |
        v
Responsive, interactive results page
```

Do not add a separate track-resolution provider, audio-analysis service, standalone emotional-profile engine, or complex scoring pipeline unless later testing demonstrates a real need.

### Security and server boundaries

- Keep Gemini and TMDB credentials on the server.
- Never expose secret keys in client-side code, public configuration, logs, or the repository.
- Validate user input and all model-generated output.
- Use request timeouts, sensible output limits, and basic abuse/rate protection.
- Handle provider errors explicitly; never fabricate a successful result when an API call fails.

---

## 4. Development roadmap

Work through one phase at a time. Before implementing a phase, review its requirements and acceptance criteria. Do not begin implementation merely because the roadmap contains a task.

## Phase 0 — Finalize planning decisions

**Goal:** agree on the product behavior and design before creating the application.

| Task | Work |
|---|---|
| 0.1 | Confirm the V1 scope and the decisions already recorded above |
| 0.2 | Finalize the accent color and typography direction |
| 0.3 | Decide exact DVD case interactions using the existing MediaPulse behavior as the reference |
| 0.4 | Decide how to handle fewer than five verified movies and complete provider failure |
| 0.5 | Define the expected movie fields and explanation length |
| 0.6 | Confirm whether the song input is title + artist only for V1 |
| 0.7 | Review the final V1 requirements and mark unresolved decisions explicitly |

**Acceptance criteria:** the V1 scope, user journey, failure behavior, and main visual direction are written down and agreed. No implementation is required to complete this phase.

## Phase 1 — Independent repository and project foundation

**Goal:** establish a clean, separate project repository.

| Task | Work |
|---|---|
| 1.1 | Choose the final repository name and create a new GitHub repository |
| 1.2 | Create a separate local project directory |
| 1.3 | Initialize Git and establish the default branch |
| 1.4 | Create `.gitignore` for secrets, dependencies, build output, and local files |
| 1.5 | Create `.env.example` with documented placeholders only |
| 1.6 | Draft the initial README and project overview |
| 1.7 | Define sensible commit conventions |
| 1.8 | Push the initial repository and verify it can be cloned |

**Acceptance criteria:** a clean repository exists independently of MediaPulse, contains no secrets, and can be cloned by another developer.

## Phase 2 — Inspect reusable MediaPulse components

**Goal:** reuse compatible code without coupling the new application to MediaPulse.

| Task | Work |
|---|---|
| 2.1 | Inspect MediaPulse's current framework, dependencies, and relevant documentation |
| 2.2 | Inspect the actual 3D DVD case implementation, including front, spine, edges, backside, rotation, and touch behavior |
| 2.3 | Identify reusable components and their dependencies |
| 2.4 | Identify incompatible or unnecessary code that should not be copied |
| 2.5 | Record the files and adaptation plan before copying anything |

**Acceptance criteria:** there is a clear, evidence-based reuse plan. The new app retains its own codebase and Git history.

## Phase 3 — Application foundation

**Goal:** establish a reliable, testable application shell.

| Task | Work |
|---|---|
| 3.1 | Initialize Next.js, React, and TypeScript |
| 3.2 | Configure linting, formatting, and testing |
| 3.3 | Set up server-side environment configuration |
| 3.4 | Create shared input and response types |
| 3.5 | Add request validation and centralized error handling |
| 3.6 | Add a simple health-check endpoint if useful for deployment |
| 3.7 | Verify local development, linting, type-checking, tests, and production build |
| 3.8 | Commit and push the verified foundation |

**Acceptance criteria:** a clean clone installs and builds correctly, with environment secrets kept out of client code and version control.

## Phase 4 — Visual design system

**Goal:** establish PitchToPicture's own minimal, atmospheric identity.

| Task | Work |
|---|---|
| 4.1 | Finalize colors, accent color, typography, spacing, and contrast |
| 4.2 | Define the near-black and midnight-blue background treatment |
| 4.3 | Design restrained waveform, haze, and light effects |
| 4.4 | Define responsive page containers and the results layout |
| 4.5 | Establish shared buttons, fields, focus states, and typography styles |
| 4.6 | Define loading, error, empty, and partial-result states |
| 4.7 | Define animation durations and reduced-motion behavior |
| 4.8 | Review the design at mobile, tablet, and desktop sizes |

**Acceptance criteria:** the design system is coherent, responsive, accessible, and distinct from MediaPulse while supporting the agreed cinematic direction.

## Phase 5 — Landing page and song input

**Goal:** let users enter a song clearly and start a recommendation session.

| Task | Work |
|---|---|
| 5.1 | Build the landing page and concise product introduction |
| 5.2 | Add a separate song-title field |
| 5.3 | Add a separate artist field |
| 5.4 | Add required-field and length validation |
| 5.5 | Add a clear submit action and keyboard support |
| 5.6 | Add the dark, atmospheric loading transition with “Turning your song into cinema…” |
| 5.7 | Add helpful input errors and prevent accidental duplicate submissions |
| 5.8 | Browser-test the complete input flow on mobile and desktop |

**Acceptance criteria:** users can enter a title and artist, receive clear validation feedback, and begin a predictable request flow.

## Phase 6 — Gemini movie recommendation service

**Goal:** let Gemini interpret the song and generate five emotionally appropriate movie suggestions directly.

| Task | Work |
|---|---|
| 6.1 | Verify current Gemini API access, free-tier limits, model availability, and terms |
| 6.2 | Configure the Gemini client on the server |
| 6.3 | Write a concise prompt focused on the song's vibe, feelings, emotions, and atmosphere |
| 6.4 | Explicitly prioritize emotional fit over genre or literal lyrical subject |
| 6.5 | Request exactly five distinct movie candidates |
| 6.6 | Require a movie title and a short, poetic explanation for each candidate |
| 6.7 | Define and validate a structured response schema |
| 6.8 | Add safe output-token limits, request timeouts, and input limits |
| 6.9 | Handle malformed output, model errors, and rate limits |
| 6.10 | Test recommendation quality with songs that have different moods and levels of popularity |

**Prompt direction:**

> You are an expert at connecting music with cinema. Given a song title and artist, interpret the song's overall vibe, feelings, emotions, and atmosphere. Recommend exactly five distinct movies that capture the emotional experience of the song. Prioritize the song's distinctive feeling over genre or literal lyrical subject. Choose films that genuinely fit its emotional world, even when their genres or plots differ. For each movie, provide its title, release year when known, and a short, poetic explanation of why its atmosphere, characters, or emotional experience matches the song. Avoid generic, repetitive, or invented movie recommendations. If uncertain about a film's details, do not fabricate them.

This is a starting prompt to test and refine, not a claim that Gemini can always know every song accurately.

**Acceptance criteria:** Gemini returns a schema-valid set of five distinct candidates with useful explanations, or the application handles the failure cleanly. The implementation does not add a separate musicology or scoring engine.

## Phase 7 — TMDB movie verification

**Goal:** verify Gemini's movie candidates and retrieve trusted movie data.

| Task | Work |
|---|---|
| 7.1 | Verify TMDB API access, terms, attribution requirements, and limits |
| 7.2 | Configure the TMDB client on the server |
| 7.3 | Search TMDB for each Gemini candidate |
| 7.4 | Match using available title, release year, and other reliable identifying information |
| 7.5 | Reject uncertain or incorrect identity matches instead of accepting a similar title blindly |
| 7.6 | Retrieve canonical TMDB ID, title, release year, poster path, and other fields needed by the UI |
| 7.7 | Handle missing posters and incomplete metadata gracefully |
| 7.8 | Deduplicate verified films |
| 7.9 | Add tests for correct matches, ambiguous titles, missing results, and API failures |
| 7.10 | Implement required TMDB attribution and links |

**Acceptance criteria:** only confidently identified movies are displayed as verified. TMDB metadata is authoritative for movie identity and displayed facts.

## Phase 8 — Recommendation orchestration and failure behavior

**Goal:** connect Gemini and TMDB into one predictable request flow.

| Task | Work |
|---|---|
| 8.1 | Validate the song input at the API boundary |
| 8.2 | Call Gemini once to obtain five candidates |
| 8.3 | Verify candidates through TMDB |
| 8.4 | For each candidate that cannot be confidently verified, request one replacement from Gemini |
| 8.5 | Verify each replacement through TMDB |
| 8.6 | Do not retry a failed replacement indefinitely |
| 8.7 | Return the verified results, up to five, without inventing substitutes |
| 8.8 | Define clear responses for zero results, partial results, timeouts, and provider failures |
| 8.9 | Prevent duplicate movies in the final response |
| 8.10 | Test the full orchestration with mocked Gemini and TMDB responses |

**Acceptance criteria:** the service returns up to five verified films, attempts only one replacement per unverified candidate, and provides explicit error or partial-result states.

## Phase 9 — 3D DVD cases and results experience

**Goal:** present recommendations as an immersive but easy-to-use cinematic collection.

| Task | Work |
|---|---|
| 9.1 | Adapt the actual MediaPulse 3D DVD case component and necessary dependencies |
| 9.2 | Preserve the front cover, centered poster, spine, edges, 3D depth, and backside design |
| 9.3 | Preserve the existing backside movie-description presentation |
| 9.4 | Connect each case to TMDB-verified movie data and Gemini's emotional explanation |
| 9.5 | Reveal cases one at a time with brief, smooth animations |
| 9.6 | Ensure all verified cases remain accessible after the reveal |
| 9.7 | Use one case per row on mobile |
| 9.8 | Use a cinematic multi-column layout on desktop |
| 9.9 | Make touch interaction and scrolling work without the 3D cases trapping gestures |
| 9.10 | Add a clear way to start another song search |
| 9.11 | Test poster loading, missing artwork, and partial result sets |

**Acceptance criteria:** the cases remain visually faithful to MediaPulse's actual implementation, work on touchscreens, and display up to five verified films with readable explanations.

## Phase 10 — Motion, accessibility, and visual polish

**Goal:** make the application feel complete without adding distracting effects.

| Task | Work |
|---|---|
| 10.1 | Refine atmospheric haze, subtle grain, and background lighting |
| 10.2 | Add restrained waveform or sound-ripple animation |
| 10.3 | Polish the loading transition and case reveal |
| 10.4 | Respect reduced-motion preferences |
| 10.5 | Verify keyboard navigation, visible focus, labels, and contrast |
| 10.6 | Verify mobile scrolling and touch targets |
| 10.7 | Optimize image loading and avoid unnecessary re-renders |
| 10.8 | Check loading states, errors, and recovery actions |
| 10.9 | Review page title, metadata, and social preview |
| 10.10 | Perform a visual review across common viewport sizes |

**Acceptance criteria:** the interface is polished, accessible, responsive, and performant. Animations remain decorative and do not claim to analyze or synchronize with real audio.

## Phase 11 — Testing, quality assurance, and security

**Goal:** verify behavior beyond the successful path.

| Task | Work |
|---|---|
| 11.1 | Test empty, malformed, and oversized input |
| 11.2 | Test Gemini output validation and malformed responses |
| 11.3 | Test that the prompt requests five distinct, emotionally matched movies |
| 11.4 | Test TMDB identity matching and ambiguous titles |
| 11.5 | Test duplicate candidates and duplicate verified films |
| 11.6 | Test one-replacement behavior and failed replacements |
| 11.7 | Test partial results and zero verified results |
| 11.8 | Test missing environment variables, provider timeouts, and rate limits |
| 11.9 | Test loading, retry, and new-search flows |
| 11.10 | Run browser tests from song entry through final results |
| 11.11 | Verify mobile, tablet, and desktop layouts |
| 11.12 | Run lint, type-check, unit tests, integration tests, and production build |
| 11.13 | Review API-key exposure, validation, request limits, and logs |
| 11.14 | Verify the project from a clean clone |
| 11.15 | Fix release-blocking defects and rerun relevant checks |

**Acceptance criteria:** all release-blocking tests pass, keys remain server-side, the production build succeeds, and the full user journey works reliably.

## Phase 12 — Deployment and portfolio release

**Goal:** publish a working, documented project.

| Task | Work |
|---|---|
| 12.1 | Compare suitable deployment platforms and verify current free-tier limits |
| 12.2 | Connect the independent GitHub repository |
| 12.3 | Configure production environment variables securely |
| 12.4 | Deploy the application |
| 12.5 | Test the deployed application and real Gemini/TMDB integrations |
| 12.6 | Verify production behavior under provider errors and rate limits |
| 12.7 | Update the README with screenshots and the live demo if available |
| 12.8 | Document architecture, setup, environment variables, and testing |
| 12.9 | Document Gemini usage, TMDB attribution, costs, and limitations |
| 12.10 | Review repository contents, Git history, licensing, and secrets |
| 12.11 | Create a versioned release when all release gates pass |

**Acceptance criteria:** the public project is usable, the repository is understandable, setup instructions work, and limitations and attribution are documented accurately.

---

## 5. GitHub workflow for every task

We will work in small, verifiable milestones rather than asking an agent to implement the entire roadmap in one large change.

1. **Review:** read the current task, its dependencies, and relevant code.
2. **Plan:** identify intended behavior, files, constraints, and acceptance criteria.
3. **Implement:** make only the changes needed for the current task.
4. **Verify:** run the appropriate tests, linting, type-checking, build, or browser checks.
5. **Inspect:** review the Git diff for accidental changes, secrets, and unnecessary complexity.
6. **Commit:** use a meaningful message for a coherent milestone.
7. **Push:** update the remote repository after meaningful verified milestones.
8. **Record:** update the roadmap with completion status and actual test evidence.

Rules:

- Do not mark a task complete just because an agent says it is complete.
- Do not commit `.env.local`, API keys, or other secrets.
- Do not silently expand scope while implementing a task.
- If verification fails, fix the failure before building further work on top of it.
- Keep the roadmap aligned with what has actually been implemented and verified.
- Use branches for larger or riskier changes when appropriate.

---

## 6. Free-first operating plan

| Component | V1 approach |
|---|---|
| Framework and tools | Open-source tools and local development |
| Source control | Independent GitHub repository |
| AI | Gemini API, subject to current model access, limits, and terms |
| Movie data | TMDB API, subject to its API conditions and attribution rules |
| Song lookup | No separate lookup provider required for the initial flow |
| Audio analysis | Excluded from V1 |
| Database | Not required |
| Authentication | Not required |
| Subscriptions | Not required |
| Hosting | Choose after checking current free-tier support and limits |

**Cost goal:** $0 for normal development and, where current provider limits permit, a usable public demo. Do not promise unlimited free production use. If a provider fails or reaches a limit, show a useful error instead of pretending the request succeeded.

---

## 7. Milestones and release gates

| Milestone | Exit condition |
|---|---|
| M0 — Planning approved | V1 scope and key product decisions agreed |
| M1 — Repository ready | Independent repository, clean setup, no secrets |
| M2 — Foundation ready | Application installs, checks, and builds |
| M3 — Design ready | Responsive design system approved |
| M4 — Input ready | Separate title and artist fields work |
| M5 — Gemini ready | Five distinct candidates and explanations validate |
| M6 — TMDB ready | Candidate identity verification and metadata retrieval work |
| M7 — Pipeline ready | One replacement attempt and partial-result behavior work |
| M8 — Results ready | DVD cases, reveal, backside, and responsive layouts work |
| M9 — Polish ready | Motion, accessibility, and mobile behavior reviewed |
| M10 — QA passed | Automated and browser checks pass |
| M11 — Public release | Deployment, documentation, and release checks complete |

---





