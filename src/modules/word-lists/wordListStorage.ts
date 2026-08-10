import type { WordList, WordListEntry } from './wordListData';

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
