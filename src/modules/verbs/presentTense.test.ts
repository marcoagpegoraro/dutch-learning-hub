import { describe, expect, it } from 'vitest';
import { buildPresentTenseQuestions, conjugatePresent } from './presentTense';

describe('present-tense conjugation', () => {
  it('conjugates regular and spelling-changing verbs', () => {
    expect(conjugatePresent('werken', 'ik')).toBe('werk');
    expect(conjugatePresent('werken', 'hij')).toBe('werkt');
    expect(conjugatePresent('lezen', 'ik')).toBe('lees');
    expect(conjugatePresent('reizen', 'ik')).toBe('reis');
  });

  it('conjugates common irregular verbs', () => {
    expect(conjugatePresent('zijn', 'ik')).toBe('ben');
    expect(conjugatePresent('zijn', 'hij')).toBe('is');
    expect(conjugatePresent('hebben', 'hij')).toBe('heeft');
  });

  it('uses the infinitive for plural subjects', () => {
    expect(conjugatePresent('gaan', 'wij')).toBe('gaan');
    expect(conjugatePresent('eten', 'jullie')).toBe('eten');
  });

  it('creates questions at every difficulty', () => {
    const questions = buildPresentTenseQuestions();
    expect(new Set(questions.map((question) => question.difficulty))).toEqual(
      new Set(['easy', 'medium', 'hard']),
    );
  });
});
