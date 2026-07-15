import { describe, expect, it } from 'vitest';
import { keywordCoverage, pictureTasks } from './pictureData';

describe('picture description', () => {
  it('provides three self-assessed tasks per difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(pictureTasks.filter((task) => task.difficulty === difficulty)).toHaveLength(3);
    }
  });

  it('calculates keyword coverage without pretending to grade grammar', () => {
    expect(
      keywordCoverage('De appels liggen op tafel en de tas ligt onder een stoel.', [
        'op',
        'onder',
        'naast',
      ]),
    ).toBe(67);
    expect(keywordCoverage('Een volledig ander antwoord.', ['op', 'onder'])).toBe(0);
  });

  it('provides keywords and multiple curated samples for every task', () => {
    for (const task of pictureTasks) {
      expect(task.keywords.length).toBeGreaterThanOrEqual(4);
      expect(task.samples.length).toBeGreaterThanOrEqual(2);
    }
  });
});
