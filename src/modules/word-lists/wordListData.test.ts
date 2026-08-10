import { describe, expect, it } from 'vitest';
import { starterWordLists } from './wordListData';

describe('starter word lists', () => {
  it('offers at least 20 words in every starter theme', () => {
    expect(starterWordLists).toHaveLength(20);
    expect(starterWordLists.every((list) => list.entries.length >= 20)).toBe(true);
  });
});
