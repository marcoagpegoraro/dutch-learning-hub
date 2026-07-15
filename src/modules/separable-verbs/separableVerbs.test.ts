import { describe, expect, it } from 'vitest';
import { buildSeparableVerbQuestions, getSeparableForm } from './separableVerbs';

describe('separable verbs', () => {
  it('separates in main clauses', () => {
    expect(getSeparableForm('opstaan', 'main')).toBe('Ik sta om zeven uur op');
    expect(getSeparableForm('meenemen', 'main')).toBe('Ik neem mijn tas mee');
  });

  it('stays joined after modals and in subordinate clauses', () => {
    expect(getSeparableForm('opbellen', 'modal')).toContain('opbellen');
    expect(getSeparableForm('aankomen', 'subordinate')).toContain('aankomt');
  });

  it('places ge between prefix and stem in participles', () => {
    expect(getSeparableForm('meenemen', 'perfect')).toContain('meegenomen');
    expect(getSeparableForm('uitgaan', 'perfect')).toContain('uitgegaan');
  });

  it('creates five questions per difficulty', () => {
    const questions = buildSeparableVerbQuestions();
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(questions.filter((question) => question.difficulty === difficulty)).toHaveLength(5);
    }
  });
});
