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
- Expanded grammar exercises for modal verbs, niet/geen, separable verbs, perfect tense, and prepositions
- Sentence-correction and curated English/Portuguese translation exercises
- Word-level answer differences for corrections and translations
- Speech-synthesis listening practice with normal and slower playback
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
