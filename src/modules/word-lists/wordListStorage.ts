import { starterWordLists, type WordList, type WordListEntry } from './wordListData';
import {
  createWordListsState,
  wordProgressKey,
  type DrillWord,
  type WordListsState,
  type WordListThemeProgress,
  type WordListSession,
} from './wordListEngine';

export const CUSTOM_WORD_LISTS_STORAGE_KEY = 'dutch-learning-hub:custom-word-lists:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeEntry(value: unknown, listId: string, index: number): WordListEntry | null {
  if (!isRecord(value)) return null;
  if (typeof value.dutch !== 'string' || typeof value.portuguese !== 'string') return null;
  const dutch = value.dutch.trim().slice(0, 120);
  const portuguese = value.portuguese.trim().slice(0, 120);
  if (!dutch || !portuguese) return null;
  return {
    id:
      typeof value.id === 'string' && value.id ? value.id.slice(0, 120) : `${listId}-${index + 1}`,
    dutch,
    portuguese,
  };
}

export function sanitizeCustomWordLists(value: unknown): WordList[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((list, index): WordList | null => {
      if (typeof list.title !== 'string' || !Array.isArray(list.entries)) return null;
      const id =
        typeof list.id === 'string' && list.id.trim()
          ? list.id.trim().slice(0, 120)
          : `custom-${index + 1}`;
      const title = list.title.trim().slice(0, 80);
      const entries = list.entries
        .map((entry, entryIndex) => sanitizeEntry(entry, id, entryIndex))
        .filter((entry): entry is WordListEntry => entry !== null)
        .slice(0, 200);
      if (!title || !entries.length) return null;
      return {
        id,
        title,
        description:
          typeof list.description === 'string' && list.description.trim()
            ? list.description.trim().slice(0, 180)
            : 'Your custom word list.',
        entries,
        kind: 'custom',
      };
    })
    .filter((list): list is WordList => list !== null);
}

export function loadCustomWordLists(): WordList[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(CUSTOM_WORD_LISTS_STORAGE_KEY);
    return stored ? sanitizeCustomWordLists(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
}

export function saveCustomWordLists(lists: WordList[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CUSTOM_WORD_LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // Local storage may be unavailable or full; the current session remains usable.
  }
}

export function sanitizeWordListsState(value: unknown): WordListsState {
  const defaults = createWordListsState();
  if (!isRecord(value)) return defaults;
  const customLists = sanitizeCustomWordLists(value.customLists).filter(
    (list) => !starterWordLists.some((starter) => starter.id === list.id),
  );
  const lists = [...starterWordLists, ...customLists];
  const knownWord = (word: unknown): word is DrillWord =>
    isRecord(word) &&
    typeof word.listId === 'string' &&
    typeof word.entryId === 'string' &&
    typeof word.review === 'boolean' &&
    lists.some(
      (list) => list.id === word.listId && list.entries.some((entry) => entry.id === word.entryId),
    );
  const count = (number: unknown) =>
    typeof number === 'number' && Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
  const themes: WordListsState['themes'] = {};
  for (const list of lists) {
    const theme = isRecord(value.themes) ? value.themes[list.id] : undefined;
    if (!isRecord(theme)) continue;
    const safe: WordListThemeProgress = { completions: count(theme.completions) };
    if (typeof theme.lastCompletedAt === 'string') safe.lastCompletedAt = theme.lastCompletedAt;
    const session = theme.session;
    if (
      isRecord(session) &&
      ['to-dutch', 'to-portuguese', 'complete'].includes(session.phase as string) &&
      Array.isArray(session.queue) &&
      session.queue.length > 0 &&
      session.queue.length <= list.entries.length + 3 &&
      session.queue.every(knownWord) &&
      Number.isInteger(session.index) &&
      (session.index as number) >= 0 &&
      (session.index as number) < session.queue.length &&
      (session.queue as DrillWord[])
        .filter((word) => !word.review)
        .map((word) => word.entryId)
        .join('\0') === list.entries.map((entry) => entry.id).join('\0') &&
      session.queue.filter((word: DrillWord) => word.review).length <= 3 &&
      new Set(session.queue.map((word: DrillWord) => JSON.stringify([word.listId, word.entryId])))
        .size === session.queue.length &&
      session.queue.every((word: DrillWord) =>
        word.review ? word.listId !== list.id : word.listId === list.id,
      )
    ) {
      safe.session = {
        phase: session.phase as WordListSession['phase'],
        index: session.index as number,
        queue: session.queue.map((word: DrillWord) => ({
          listId: word.listId,
          entryId: word.entryId,
          review: word.review,
        })),
        feedback:
          session.feedback === 'wrong' || session.feedback === 'revealed' ? session.feedback : null,
      };
    }
    themes[list.id] = safe;
  }
  const words: WordListsState['words'] = {};
  if (isRecord(value.words)) {
    for (const list of lists)
      for (const entry of list.entries)
        for (const direction of ['to-dutch', 'to-portuguese'] as const) {
          const key = wordProgressKey(
            { listId: list.id, entryId: entry.id, review: false },
            direction,
          );
          const stat = value.words[key];
          if (isRecord(stat))
            words[key] = {
              correct: count(stat.correct),
              mistakes: count(stat.mistakes),
              lastPracticedAt: typeof stat.lastPracticedAt === 'string' ? stat.lastPracticedAt : '',
            };
        }
  }
  return { customLists, themes, words };
}
