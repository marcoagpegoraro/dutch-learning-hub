# Dutch Learning Hub

Phases 1–4 of a static, modular Dutch-learning application. The original clock exercise now lives inside the React application as the time-practice module.

## Included

- React, TypeScript, and Vite
- Bootstrap 5 and Bootstrap Icons
- `HashRouter` navigation suitable for GitHub Pages
- Dashboard cards for all planned modules
- Fully functional Dutch time practice with analog, digital, and random clocks
- Core A1 exercises for de/het, vocabulary, numbers, dates, present-tense verbs, word order, and missing words
- Drag-and-drop plus click-to-build, keyboard-accessible word-order questions
- Functional mistake review with 1, 3, 7, 14, and 30-day intervals
- Questions & Answers: 30 original English-prompt scenarios, 60 question/answer exercises, three practice modes, saved mastery, Dutch audio, and Portuguese guides for questions, omdat, om … te, want, daarom, dat, als, en/maar, perfectum, hoewel, terwijl, voordat, nadat, zodat, and indirect of
- Expanded grammar exercises for modal verbs, niet/geen, separable verbs, perfect tense, and prepositions
- Sentence-correction and curated English/Portuguese translation exercises
- Word-level answer differences for corrections and translations
- Dutch text-to-speech throughout exercises, word-list study sheets, corrections, course examples, conversations, picture descriptions, review, and history, with normal/slower playback and shared stop controls
- Explicit Dutch-only voice selection with a persistent voice picker and pronunciation test in Settings; speech waits for an available Dutch voice instead of using the browser default
- Speech-synthesis listening practice with normal and slower playback
- Finite Vertalen queues that persist correctly translated phrases, show completed phrases, and guide learners to the next difficulty when finished
- Eight predefined branching conversation scenarios
- Self-assessed picture-description practice with curated examples
- Experimental pronunciation shadowing with explicit browser and scoring limitations
- Easy, medium, and hard time generation
- Themed word-list memorisation with 40 themes and 800 Dutch–Portuguese word pairs, searchable by theme or word
- Study sheets, custom lists, Portuguese → Dutch followed by Dutch → Portuguese rounds, and restarts after revealing or missing a theme word
- Saved theme completion, resumable sessions, repeatable reviews, and up to three interleaved earlier words prioritised by mistake count
- Word-list sessions, word statistics, and custom lists included in progress backups, with migration of previously saved custom lists
- Shared XP, streak, accuracy, history, and mistake tracking
- Versioned and validated `localStorage` state at `dutch-learning-hub:v1`
- Persistent settings plus progress export, import, and confirmed reset
- Unit tests for time, normalization, storage, numbers, dates, verbs, word order, grammar rules, answer differences, quizzes, and review scheduling
- Typed placeholder routes for modules planned after Phase 4

## A2 preparation trail

Open **Trilha A2** in the navigation, or `/#/a2`. Twelve draft units contain 36 distinct cases and 288 activities spanning reading, listening, writing, speaking, interaction, and mediation. Each unit offers practice, a new situation, and a later review.

- Start with the transport pilot. Documents, audio, free responses, local voice recording, scripted multi-turn interaction, and mediation are available in every unit.
- Objective answers, self-assessment, and imported manual reviews are distinguished. Evidence is stored separately from XP and the capped quiz history. Assistance and previously seen feedback are recorded.
- Recordings remain in IndexedDB. **A2 → Portfólio** exports/imports responses and audio together; a standard Settings backup includes response metadata but not audio files.
- **A2 → Área de revisão manual** opens a student's portfolio locally, supports rubric-based review, and exports an evaluation file for the student to import. Reviewer identities are not authenticated and these scores are not certification.
- The 180 audio assets are synthetic Dutch speech (Xander, nl-NL; Ellen, nl-BE), with scripts and generation hashes in `public/audio/a2/manifest.json`. Native-speaker/pedagogical review and testing with learners remain pending.
- Audio packs can be downloaded per unit in the published PWA. Offline byte-range handling supports native audio seeking. Assets are versioned against their scripts.
- Regenerate authored draft materials with `python3 scripts/create-a2-content.py`. On macOS with the named Dutch voices installed, run `python3 scripts/generate-a2-audio.py` with access to system speech services, then format and verify.

See [implementation status and review workflow](docs/IMPLEMENTACAO-A2.md) and [the original plan](docs/PLANO-A2.md).

## Local development

```bash
pnpm install
pnpm dev
```

Run verification:

```bash
pnpm test
pnpm build
pnpm lint
```

## GitHub Pages

The repository workflow at `.github/workflows/deploy-pages.yml` tests and builds the root application on pushes to `main`, then deploys `dist`.

In the GitHub repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Routes use URL hashes, and Vite emits relative asset paths, so the site works at a repository Pages path without a fallback file.

## Storage

All learning data remains in the browser. Use **Settings → Export progress** before clearing browser data or moving to another browser.
