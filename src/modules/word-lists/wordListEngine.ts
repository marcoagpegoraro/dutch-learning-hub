import type { WordList } from './wordListData';

export type WordListDirection = 'to-dutch' | 'to-portuguese';
export interface DrillWord {
  listId: string;
  entryId: string;
  review: boolean;
}
export interface WordListSession {
  phase: WordListDirection | 'complete';
  index: number;
  queue: DrillWord[];
  feedback: 'wrong' | 'revealed' | null;
}
export interface WordListThemeProgress {
  completions: number;
  lastCompletedAt?: string;
  session?: WordListSession;
}
export interface WordListWordProgress {
  correct: number;
  mistakes: number;
  lastPracticedAt: string;
}
export interface WordListsState {
  customLists: WordList[];
  themes: Record<string, WordListThemeProgress>;
  words: Record<string, WordListWordProgress>;
}
export const createWordListsState = (): WordListsState => ({
  customLists: [],
  themes: {},
  words: {},
});
export const wordProgressKey = (word: DrillWord, direction: WordListDirection): string =>
  JSON.stringify([word.listId, word.entryId, direction]);

export function createWordListSession(
  list: WordList,
  lists: WordList[],
  state: WordListsState,
): WordListSession {
  const currentWords = new Set(list.entries.map((entry) => entry.dutch.toLocaleLowerCase('nl')));
  const candidates = lists
    .filter((other) => other.id !== list.id)
    .flatMap((other) =>
      other.entries.flatMap((entry) => {
        const word = { listId: other.id, entryId: entry.id, review: true };
        const stats = (['to-dutch', 'to-portuguese'] as const).map(
          (direction) => state.words[wordProgressKey(word, direction)],
        );
        if (currentWords.has(entry.dutch.toLocaleLowerCase('nl')) || !stats.some(Boolean))
          return [];
        return [
          {
            word,
            dutch: entry.dutch,
            mistakes: stats.reduce((sum, stat) => sum + (stat?.mistakes ?? 0), 0),
            lastPracticedAt:
              stats
                .map((stat) => stat?.lastPracticedAt ?? '')
                .sort()
                .at(-1) ?? '',
          },
        ];
      }),
    )
    .sort((a, b) => b.mistakes - a.mistakes || a.lastPracticedAt.localeCompare(b.lastPracticedAt));
  const seen = new Set<string>();
  const reviews = candidates
    .filter((candidate) => {
      const key = candidate.dutch.toLocaleLowerCase('nl');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, Math.min(3, Math.floor(list.entries.length / 5)));
  const queue = list.entries.flatMap((entry, index) => {
    const word = { listId: list.id, entryId: entry.id, review: false };
    const review = (index + 1) % 5 === 0 ? reviews[(index + 1) / 5 - 1]?.word : undefined;
    return review ? [word, review] : [word];
  });
  return { phase: 'to-dutch', index: 0, queue, feedback: null };
}

export function startWordList(
  state: WordListsState,
  list: WordList,
  lists: WordList[],
  restart = false,
): WordListsState {
  const theme = state.themes[list.id] ?? { completions: 0 };
  if (!restart && theme.session && theme.session.phase !== 'complete') return state;
  return {
    ...state,
    themes: {
      ...state.themes,
      [list.id]: { ...theme, session: createWordListSession(list, lists, state) },
    },
  };
}

export function answerWordList(
  state: WordListsState,
  listId: string,
  outcome: 'correct' | 'wrong' | 'revealed',
  now = new Date().toISOString(),
): WordListsState {
  const theme = state.themes[listId];
  const session = theme?.session;
  if (!session || session.phase === 'complete' || session.feedback) return state;
  const word = session.queue[session.index];
  if (!word) return state;
  const key = wordProgressKey(word, session.phase);
  const previous = state.words[key] ?? { correct: 0, mistakes: 0, lastPracticedAt: '' };
  const correct = outcome === 'correct';
  let next: WordListSession = { ...session, feedback: correct ? null : outcome };
  let completion = false;
  if (correct) {
    if (session.index + 1 < session.queue.length) next.index += 1;
    else if (session.phase === 'to-dutch') next = { ...session, phase: 'to-portuguese', index: 0 };
    else {
      next = { ...session, phase: 'complete' };
      completion = true;
    }
  }
  return {
    ...state,
    words: {
      ...state.words,
      [key]: {
        correct: previous.correct + Number(correct),
        mistakes: previous.mistakes + Number(!correct),
        lastPracticedAt: now,
      },
    },
    themes: {
      ...state.themes,
      [listId]: {
        ...theme,
        session: next,
        completions: theme.completions + Number(completion),
        ...(completion ? { lastCompletedAt: now } : {}),
      },
    },
  };
}

export function retryWordList(state: WordListsState, listId: string): WordListsState {
  const theme = state.themes[listId];
  const session = theme?.session;
  if (!session?.feedback) return state;
  // An inserted review is retried in place; a theme word restarts its current direction.
  return {
    ...state,
    themes: {
      ...state.themes,
      [listId]: {
        ...theme,
        session: {
          ...session,
          index: session.queue[session.index]?.review ? session.index : 0,
          feedback: null,
        },
      },
    },
  };
}

export function removeWordList(state: WordListsState, listId: string): WordListsState {
  const themes = Object.fromEntries(
    Object.entries(state.themes)
      .filter(([id]) => id !== listId)
      .map(([id, theme]) => {
        const session = theme.session;
        if (!session) return [id, theme];
        const queue = session.queue.filter((word) => word.listId !== listId);
        const index = Math.min(
          queue.length - 1,
          session.queue.slice(0, session.index).filter((word) => word.listId !== listId).length,
        );
        return [
          id,
          {
            ...theme,
            session: {
              ...session,
              queue,
              index,
              feedback: session.queue[session.index]?.listId === listId ? null : session.feedback,
            },
          },
        ];
      }),
  );
  const deletedEntries = new Set(
    state.customLists
      .find((list) => list.id === listId)
      ?.entries.flatMap((entry) =>
        (['to-dutch', 'to-portuguese'] as const).map((direction) =>
          wordProgressKey({ listId, entryId: entry.id, review: false }, direction),
        ),
      ) ?? [],
  );
  return {
    customLists: state.customLists.filter((list) => list.id !== listId),
    themes,
    words: Object.fromEntries(
      Object.entries(state.words).filter(([key]) => !deletedEntries.has(key)),
    ),
  };
}
