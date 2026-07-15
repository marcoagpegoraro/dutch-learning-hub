import { describe, expect, it } from 'vitest';
import { wordOrderQuestions } from './wordOrderData';
import { isCorrectWordOrder, pickOrderingQuestion } from './wordOrderUtils';

describe('word-order behavior', () => {
  it('accepts the exact order with normalized capitalization and whitespace', () => {
    expect(isCorrectWordOrder(['ik', '  drink', 'koffie '], ['Ik', 'drink', 'koffie'])).toBe(true);
  });

  it('rejects words in the wrong order', () => {
    expect(isCorrectWordOrder(['Ik', 'koffie', 'drink'], ['Ik', 'drink', 'koffie'])).toBe(false);
  });

  it('selects only questions at the requested difficulty', () => {
    expect(pickOrderingQuestion(wordOrderQuestions, 'medium', undefined, () => 0).difficulty).toBe(
      'medium',
    );
  });

  it('has complete curated sets for all levels', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(
        wordOrderQuestions.filter((question) => question.difficulty === difficulty),
      ).toHaveLength(6);
    }
  });
});
