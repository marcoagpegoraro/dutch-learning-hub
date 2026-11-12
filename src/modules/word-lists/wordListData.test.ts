import { describe, expect, it } from 'vitest';
import { starterWordLists } from './wordListData';

describe('starter word lists', () => {
  it('offers at least 20 words in every starter theme', () => {
    expect(starterWordLists).toHaveLength(40);
    expect(starterWordLists.every((list) => list.entries.length >= 20)).toBe(true);
  });

  it('uses unique, stable list and entry identifiers with complete translations', () => {
    expect(new Set(starterWordLists.map((list) => list.id)).size).toBe(starterWordLists.length);
    for (const list of starterWordLists) {
      expect(new Set(list.entries.map((entry) => entry.id)).size).toBe(list.entries.length);
      expect(list.entries.every((entry) => entry.dutch.trim() && entry.portuguese.trim())).toBe(
        true,
      );
    }
  });
});
