import { describe, expect, it } from 'vitest';
import { pronunciationPhrases, recognitionMatchPercent } from './pronunciationData';

describe('pronunciation recognition matching', () => {
  it('normalizes capitalization and final punctuation', () => {
    expect(recognitionMatchPercent('Goedemorgen', 'GOEDEMORGEN!')).toBe(100);
  });

  it('reports partial ordered word coverage', () => {
    expect(recognitionMatchPercent('ik woon in delft', 'ik woon delft')).toBe(75);
    expect(recognitionMatchPercent('ik woon in delft', 'delft ik woon')).toBe(50);
  });

  it('provides five phrases per difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(
        pronunciationPhrases.filter((phrase) => phrase.difficulty === difficulty),
      ).toHaveLength(5);
    }
  });
});
