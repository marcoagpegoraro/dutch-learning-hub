import { describe, expect, it } from 'vitest';
import { buildModalVerbQuestions, conjugateModal } from './modalVerbs';

describe('modal verbs', () => {
  it('conjugates all five modal verbs', () => {
    expect(conjugateModal('kunnen', 'ik')).toBe('kan');
    expect(conjugateModal('willen', 'jij')).toBe('wilt');
    expect(conjugateModal('mogen', 'hij')).toBe('mag');
    expect(conjugateModal('moeten', 'wij')).toBe('moeten');
    expect(conjugateModal('zullen', 'ik')).toBe('zal');
  });

  it('builds five questions at each difficulty', () => {
    const questions = buildModalVerbQuestions();
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(questions.filter((question) => question.difficulty === difficulty)).toHaveLength(5);
    }
  });
});
