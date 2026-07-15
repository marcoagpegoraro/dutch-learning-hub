# Dutch Learning Hub — Codex Implementation Specification

## 1. Goal

Transform the existing **Dutch Clock Practice** static app into a modular Dutch-learning web application that can be deployed to **GitHub Pages**.

The application should help beginner learners progress toward **CEFR A1**, with some optional A2 material later.

The app must remain:

- Fully static
- Usable without a backend
- Deployable on GitHub Pages
- Responsive on desktop and mobile
- Persistent through `localStorage`
- Easy to extend with new exercise modules
- Accessible and keyboard-friendly

## 2. Recommended stack

Use:

- React
- TypeScript
- Vite
- React Router with `HashRouter`
- Bootstrap 5
- Bootstrap Icons
- Vitest for unit tests
- ESLint and Prettier
- Browser `localStorage`
- Optional Web Speech APIs for listening and pronunciation exercises

Do not add a backend in the first version.

Use `HashRouter` because normal browser-history routes can fail on GitHub Pages without special fallback configuration.

## 3. Migration strategy

The existing Dutch Clock Practice app should not be discarded.

1. Create a fresh React + TypeScript + Vite project.
2. Copy the behavior and visual design of the current clock app into a dedicated `TimePractice` module.
3. Verify that the migrated clock exercise behaves the same as the existing app.
4. Add the dashboard, shared scoring system, settings, and progress storage.
5. Add the other modules incrementally.
6. Keep the original clock project available as a reference until migration is complete.

## 4. Product structure

### Main navigation

- Dashboard
- Learn
- Review mistakes
- Progress
- Achievements
- Settings
- About

### Dashboard

Show:

- Current streak
- Total XP
- Daily goal
- Exercises completed today
- Accuracy
- Recommended next lesson
- Weakest topics
- Recent activity
- Continue-learning button
- Grid of available learning modules

### Shared exercise interface

Every exercise module should reuse the same layout:

- Module title
- Difficulty selector
- Progress indicator
- Prompt area
- Answer controls
- Toggleable hint
- Submit button
- Skip button
- Feedback panel
- Correct answer after an error
- Explanation
- Next-question button
- Session score
- Exit-session button

## 5. Modules

### 5.1 Dutch Time Practice

Migrate the existing app.

Modes:

- Analog clock
- Digital clock
- Random

Difficulty:

- Easy: full and half hours
- Medium: quarter hours and five-minute intervals
- Hard: all minute values and multiple accepted expressions

Examples:

- elf uur
- half twaalf
- kwart over elf
- twintig voor twaalf
- vijf over half twaalf

### 5.2 Word Order Trainer

Display shuffled tokens that the learner must arrange into a correct sentence.

Difficulty:

- Easy: subject + verb + object
- Medium: inversion, modal verbs, negation
- Hard: subordinate clauses, perfect tense, separable verbs

Features:

- Drag and drop
- Click-to-build alternative for accessibility
- Explain the sentence structure
- Highlight misplaced words after an incorrect attempt

### 5.3 De / Het Trainer

Show a noun, optionally with an emoji or image, and ask the learner to choose `de` or `het`.

Store article accuracy separately.

Include:

- Singular article
- Plural form
- Diminutive rule
- Example sentence
- Common article patterns

### 5.4 Verb Conjugation Trainer

Practice:

- Present tense
- Past tense
- Perfect tense
- Modal verbs
- Irregular verbs

Question types:

- Fill in the blank
- Multiple choice
- Full conjugation table
- Choose `hebben` or `zijn`
- Build the participle

### 5.5 Listening Trainer

Use browser speech synthesis to pronounce Dutch words and sentences.

Exercises:

- Listen and select the matching text
- Listen and type the phrase
- Listen to a time expression and select the clock
- Listen to a number and type it

Provide replay and slower-speed controls.

### 5.6 Preposition Trainer

Practice:

- in
- op
- onder
- naast
- achter
- voor
- tussen
- boven
- tegenover

Use simple illustrations, emojis, or CSS diagrams so the app remains static.

### 5.7 Separable Verb Trainer

Practice verbs such as:

- opstaan
- aankomen
- meenemen
- afspreken
- uitgaan
- terugkomen
- aandoen
- opbellen

Exercise forms:

- Main clause
- Modal construction
- Perfect tense
- Subordinate clause

### 5.8 Translation Trainer

Portuguese or English to Dutch.

Start with curated answer variants rather than AI evaluation.

Answer checking should:

- Ignore capitalization
- Normalize repeated whitespace
- Ignore optional final punctuation
- Accept explicitly configured alternatives
- Show differences between expected and submitted text

Do not claim that semantically different answers are correct unless they are in the accepted-answer list.

### 5.9 Modal Verb Trainer

Focus on:

- kunnen
- willen
- mogen
- moeten
- zullen

Practice conjugation, meaning, and sentence structure.

### 5.10 Negation Trainer

Practice the distinction between:

- niet
- geen

Include placement rules and explanations.

### 5.11 Perfect Tense Builder

Build complete perfect-tense sentences.

Steps may include:

1. Choose `hebben` or `zijn`
2. Select or type the participle
3. Arrange the full sentence
4. Read the explanation

### 5.12 Picture Description

Show a locally bundled illustration and ask the learner to describe it.

For the static first version:

- Provide keywords
- Compare against curated sample sentences
- Allow learners to reveal sample answers
- Let learners self-mark their answer
- Do not pretend to offer reliable free-form AI correction

An AI-backed version may be added later as an optional external service.

### 5.13 Vocabulary Builder

Initial categories:

- Home
- Kitchen
- Office
- Transport
- Supermarket
- Restaurant
- Family
- Clothing
- Weather
- Body
- Daily routine
- City

Each word record should support:

- Dutch word
- Article
- English meaning
- Portuguese meaning
- Plural
- Example sentence
- Category
- Difficulty
- Optional emoji or local image
- Optional speech playback

### 5.14 Conversation Simulator

Use branching, predefined conversations rather than AI in version 1.

Scenarios:

- Supermarket
- Train station
- Restaurant
- Doctor
- Municipality
- Workplace
- Introducing yourself
- Asking for directions

The user selects or types responses and receives feedback.

### 5.15 Find the Mistake

Show an incorrect sentence and ask the learner to identify and fix the error.

Topics:

- Verb agreement
- Word order
- Article
- Pronoun
- Negation
- Adjective ending
- Preposition
- Plural
- Spelling

### 5.16 Number Trainer

Practice:

- 0–100
- Hundreds
- Thousands
- Prices
- Phone numbers
- Years
- Decimals

Accept Dutch words with normalized spacing and hyphens where appropriate.

### 5.17 Date and Calendar Trainer

Practice:

- Weekdays
- Months
- Dates
- Ordinal numbers
- Appointments
- Relative dates
- Reading calendar entries

### 5.18 Pronunciation Shadowing

Use browser speech recognition only as an experimental feature.

Requirements:

- Clearly mark browser compatibility
- Provide the expected phrase
- Allow playback
- Allow recording through supported browsers
- Treat recognition results as approximate
- Never present the score as a professional pronunciation assessment

### 5.19 Fill the Missing Word

Support:

- Multiple choice
- Typed answer
- Contextual vocabulary
- Grammar-specific sets

Always show a brief explanation.

### 5.20 Grammar Boss Battles

A gamified session mode that combines existing questions.

Rules:

- Correct answer damages the boss
- Wrong answer reduces player health
- Streaks produce bonuses
- Bosses represent topics
- No unique grammar engine is required; reuse question generators from other modules

## 6. A1 learning path

Create a guided A1 path in addition to free practice.

Suggested units:

1. Greetings and introductions
2. Personal information
3. Numbers and age
4. Days, dates, and time
5. Family and possessives
6. Home and common objects
7. Present-tense verbs
8. Daily routine
9. Food and shopping
10. Transport and directions
11. Modal verbs
12. Word order and inversion
13. `niet` and `geen`
14. Separable verbs
15. Basic perfect tense
16. A1 mixed review

Each unit should contain several short lessons and a checkpoint.

## 7. Difficulty system

Use three shared levels:

### Easy

- Recognition
- Multiple choice
- Common vocabulary
- Strong hints
- Short sentences

### Medium

- Typed answers
- Fewer hints
- Broader vocabulary
- Basic transformations

### Hard

- Sentence production
- Minimal hints
- Irregular forms
- Distractors
- Mixed grammar topics

Difficulty definitions may be customized per module.

## 8. Data architecture

Keep lesson content separate from UI logic.

Suggested structure:

```text
src/
  app/
    App.tsx
    router.tsx
  components/
    AppNavbar.tsx
    ExerciseShell.tsx
    FeedbackPanel.tsx
    HintPanel.tsx
    ProgressBar.tsx
    ScoreSummary.tsx
  modules/
    time/
    word-order/
    articles/
    verbs/
    listening/
    prepositions/
    separable-verbs/
    translation/
    modal-verbs/
    negation/
    perfect-tense/
    picture-description/
    vocabulary/
    conversations/
    find-the-mistake/
    numbers/
    dates/
    pronunciation/
    missing-word/
    boss-battle/
  data/
    vocabulary/
    grammar/
    conversations/
  hooks/
    useLocalStorage.ts
    useExerciseSession.ts
    useSpeechSynthesis.ts
  services/
    storage.ts
    scoring.ts
    answerNormalization.ts
    spacedRepetition.ts
  types/
    exercise.ts
    progress.ts
    settings.ts
  pages/
    DashboardPage.tsx
    LearnPage.tsx
    ReviewPage.tsx
    ProgressPage.tsx
    SettingsPage.tsx
  styles/
```

## 9. Common exercise types

Use reusable types rather than implementing every module independently.

Suggested TypeScript model:

```ts
type Difficulty = 'easy' | 'medium' | 'hard';

interface BaseQuestion {
  id: string;
  moduleId: string;
  difficulty: Difficulty;
  prompt: string;
  hint?: string;
  explanation?: string;
  tags: string[];
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  acceptedAnswers: string[];
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctOption: string;
}

interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  tokens: string[];
  correctOrder: string[];
}
```

Modules with special behavior, such as clocks or speech, may extend these base types.

## 10. Answer normalization

Implement a shared answer-normalization service.

Default normalization:

- Trim whitespace
- Convert to lowercase
- Collapse multiple spaces
- Remove optional final punctuation
- Normalize straight and curly apostrophes
- Optionally normalize hyphens

Do not automatically remove meaningful Dutch word distinctions.

Each question should supply multiple accepted answers where legitimate variants exist.

## 11. Progress and scoring

Store:

- Total XP
- Current streak
- Longest streak
- Daily goal
- Last active date
- Module accuracy
- Difficulty accuracy
- Completed lessons
- Question history
- Mistakes
- Mastered items
- Achievements
- User settings

Suggested scoring:

- Easy correct answer: 5 XP
- Medium: 10 XP
- Hard: 15 XP
- First-attempt bonus: 2 XP
- Streak bonus after five answers
- Reduced XP after revealing the answer

## 12. Mistake review and spaced repetition

Every incorrect answer should create or update a review item.

Suggested review intervals:

- Again: later in the current session
- 1 day
- 3 days
- 7 days
- 14 days
- 30 days

Store only enough history to keep `localStorage` manageable.

Allow:

- Review all mistakes
- Review by module
- Review due items
- Reset an item
- Mark an item as known

## 13. Local storage

Use one versioned root object:

```ts
interface AppState {
  version: number;
  profile: UserProfile;
  progress: ProgressState;
  review: ReviewState;
  settings: AppSettings;
}
```

Storage key:

```text
dutch-learning-hub:v1
```

Requirements:

- Validate loaded data
- Migrate older schemas
- Recover gracefully from corrupted data
- Export progress as JSON
- Import progress from JSON
- Reset all progress only after confirmation

## 14. Accessibility

- Full keyboard navigation
- Visible focus states
- Proper labels
- ARIA live region for correctness feedback
- Do not rely on color alone
- Support reduced motion
- Ensure clock exercises have text alternatives
- Use sufficiently large touch targets
- Keep language attributes correct for Dutch phrases

## 15. Offline and PWA support

After the core app works, optionally add:

- Web app manifest
- Service worker
- Installable PWA behavior
- Offline caching

Do not let PWA work delay the main exercise functionality.

## 16. GitHub Pages deployment

Configure Vite correctly for the repository path.

Prefer a GitHub Actions deployment workflow.

Requirements:

- Build on push to `main`
- Run tests before deployment
- Deploy `dist`
- Document the required repository Pages setting
- Ensure all routes work with `HashRouter`

## 17. Testing

Prioritize tests for:

- Dutch time-expression generation
- Answer normalization
- Number-to-Dutch conversion
- Date formatting
- Verb conjugation rules
- Scoring
- Review scheduling
- Storage migrations

Add a small end-to-end smoke test later.

## 18. Implementation phases

### Phase 1 — Foundation

- React/Vite setup
- Bootstrap layout
- Hash routing
- Dashboard
- Shared exercise shell
- Local-storage state
- Settings
- Progress page
- Migrate clock trainer

### Phase 2 — A1 essentials

- De/het
- Vocabulary
- Numbers
- Dates
- Present-tense verbs
- Word order
- Missing-word exercises
- Mistake review

### Phase 3 — Grammar expansion

- Modal verbs
- Negation
- Separable verbs
- Perfect tense
- Prepositions
- Find the mistake
- Translation

### Phase 4 — Listening and conversation

- Speech synthesis
- Listening exercises
- Branching conversations
- Picture descriptions
- Experimental speech recognition

### Phase 5 — Gamification and polish

- Guided A1 path
- Achievements
- Daily goals
- Boss battles
- PWA
- Content expansion
- Accessibility audit

## 19. First Codex task

Start with this request:

> Inspect the existing Dutch Clock Practice project. Create a new React + TypeScript + Vite application in a separate folder named `dutch-learning-hub`. Use Bootstrap 5 and React Router `HashRouter`. Implement the app shell, dashboard, shared local-storage model, settings page, progress page, and migrate the existing clock exercise into `src/modules/time`. Preserve the existing clock app until the migration is verified. Add tests for Dutch time-expression generation and answer normalization. Configure GitHub Pages deployment through GitHub Actions. Do not implement the other learning modules yet; create typed placeholders and dashboard cards for them.

## 20. Definition of done for Phase 1

Phase 1 is complete when:

- The app runs with `npm run dev`
- Production build succeeds
- Tests pass
- GitHub Pages deployment works
- Dashboard displays all planned modules
- Clock practice is fully functional
- Difficulty, tips, score, and feedback work
- Progress survives page reloads
- Settings survive page reloads
- Data can be exported, imported, and reset
- Placeholder modules clearly show that they are coming later
- No backend is required
