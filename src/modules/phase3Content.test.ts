import { describe, expect, it } from 'vitest';
import { learningModules } from '../data/modules';
import { mistakeQuestions } from './find-the-mistake/mistakeData';
import { prepositionQuestions } from './prepositions/prepositionData';
import { translationQuestions } from './translation/translationData';

const phase3Ids = [
  'modal-verbs',
  'negation',
  'separable-verbs',
  'perfect-tense',
  'prepositions',
  'find-the-mistake',
  'translation',
];

describe('Phase 3 content', () => {
  it('marks every Phase 3 dashboard module as available', () => {
    for (const moduleId of phase3Ids) {
      expect(learningModules.find((module) => module.id === moduleId)).toMatchObject({
        status: 'available',
        route: `/practice/${moduleId}`,
      });
    }
  });

  it.each([
    ['prepositions', prepositionQuestions],
    ['find the mistake', mistakeQuestions],
    ['translation', translationQuestions],
  ])('provides balanced %s content', (_name, questions) => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(questions.filter((question) => question.difficulty === difficulty)).toHaveLength(5);
    }
  });
});
