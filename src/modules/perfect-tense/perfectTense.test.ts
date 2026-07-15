import { describe, expect, it } from 'vitest';
import { buildPerfectTenseQuestions, getPerfectVerb } from './perfectTense';

describe('perfect tense', () => {
  it('uses hebben for common transitive and activity verbs', () => {
    expect(getPerfectVerb('werken')).toMatchObject({ auxiliary: 'hebben', participle: 'gewerkt' });
    expect(getPerfectVerb('eten')).toMatchObject({ auxiliary: 'hebben', participle: 'gegeten' });
  });

  it('uses zijn for movement and change-of-state examples', () => {
    expect(getPerfectVerb('gaan')).toMatchObject({ auxiliary: 'zijn', participle: 'gegaan' });
    expect(getPerfectVerb('komen')).toMatchObject({ auxiliary: 'zijn', participle: 'gekomen' });
  });

  it('includes both auxiliaries in easy recognition questions', () => {
    const easy = buildPerfectTenseQuestions().filter((question) => question.difficulty === 'easy');
    const answers = easy.flatMap((question) =>
      question.type === 'multiple-choice' ? [question.correctOption] : [],
    );
    expect(new Set(answers)).toEqual(new Set(['hebben', 'zijn']));
  });
});
