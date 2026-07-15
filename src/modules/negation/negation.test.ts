import { describe, expect, it } from 'vitest';
import { chooseNegation, negationQuestions } from './negation';

describe('niet versus geen', () => {
  it('uses geen for indefinite nouns', () => {
    expect(chooseNegation('indefinite-noun')).toBe('geen');
    expect(chooseNegation('plural-indefinite')).toBe('geen');
  });

  it('uses niet for verbs, adjectives, and definite references', () => {
    expect(chooseNegation('verb')).toBe('niet');
    expect(chooseNegation('adjective')).toBe('niet');
    expect(chooseNegation('definite-noun')).toBe('niet');
    expect(chooseNegation('proper-noun')).toBe('niet');
  });

  it('provides an even three-level exercise set', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(
        negationQuestions.filter((question) => question.difficulty === difficulty),
      ).toHaveLength(5);
    }
  });
});
