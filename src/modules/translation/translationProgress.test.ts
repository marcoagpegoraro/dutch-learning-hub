import { describe, expect, it } from 'vitest';
import { recordAttempt, type AttemptInput } from '../../services/progress';
import {
  createDefaultState,
  parseImportedState,
  validateAndMigrateState,
} from '../../services/storage';
import { pickUnmasteredQuizQuestion, remainingQuizQuestions } from '../shared/quizUtils';
import { translationQuestions } from './translationData';

const attempt = (questionId: string, correct = true): AttemptInput => ({
  questionId,
  moduleId: 'translation',
  difficulty: 'easy',
  prompt: 'Translate',
  submittedAnswer: 'goedemorgen',
  correctAnswer: 'goedemorgen',
  correct,
  xpEarned: correct ? 10 : 0,
});
const easy = translationQuestions.filter((question) => question.difficulty === 'easy');

describe('Vertalen progress', () => {
  it('removes correct phrases permanently while retaining wrong and skipped phrases', () => {
    let state = createDefaultState();
    state = recordAttempt(state, attempt(easy[0].id));
    state = recordAttempt(state, attempt(easy[1].id, false));
    state = recordAttempt(state, { ...attempt(easy[2].id, false), submittedAnswer: '(skipped)' });
    expect(state.progress.masteredItems).toEqual([easy[0].id]);
    expect(
      remainingQuizQuestions(translationQuestions, 'easy', state.progress.masteredItems).map(
        (question) => question.id,
      ),
    ).toEqual(easy.slice(1).map((question) => question.id));
    expect(
      pickUnmasteredQuizQuestion(
        translationQuestions,
        'easy',
        state.progress.masteredItems,
        undefined,
        () => 0,
      )?.id,
    ).toBe(easy[1].id);
  });

  it('finishes a difficulty without falling back to other questions, including after reloading a backup', () => {
    let state = createDefaultState();
    for (const question of easy) state = recordAttempt(state, attempt(question.id));
    state = parseImportedState(JSON.stringify(state));
    expect(
      pickUnmasteredQuizQuestion(translationQuestions, 'easy', state.progress.masteredItems),
    ).toBeUndefined();
    expect(
      pickUnmasteredQuizQuestion(translationQuestions, 'medium', state.progress.masteredItems)
        ?.difficulty,
    ).toBe('medium');
    expect(
      remainingQuizQuestions(translationQuestions, 'hard', state.progress.masteredItems),
    ).toHaveLength(5);
  });

  it('retains mastery after history truncation and never duplicates or removes saved acertos', () => {
    let state = recordAttempt(createDefaultState(), attempt(easy[0].id));
    for (let index = 0; index < 260; index++)
      state = recordAttempt(state, { ...attempt(`time-${index}`, false), moduleId: 'time' });
    state = recordAttempt(state, attempt(easy[0].id));
    state = recordAttempt(state, attempt(easy[0].id, false));
    expect(state.progress.questionHistory).toHaveLength(250);
    expect(state.progress.masteredItems).toEqual([easy[0].id]);
  });

  it('preserves earlier correct translations when migrating old progress', () => {
    const state = recordAttempt(createDefaultState(), attempt(easy[0].id));
    state.progress.masteredItems = [];
    expect(validateAndMigrateState(state).progress.masteredItems).toEqual([easy[0].id]);
    expect(createDefaultState().progress.masteredItems).toEqual([]);
  });

  it('keeps unsolved phrases eligible and avoids an immediate repeat when alternatives exist', () => {
    expect(
      pickUnmasteredQuizQuestion(translationQuestions, 'easy', [], easy[0].id, () => 0)?.id,
    ).toBe(easy[1].id);
    expect(
      pickUnmasteredQuizQuestion(
        translationQuestions,
        'easy',
        easy.slice(1).map((question) => question.id),
      )?.id,
    ).toBe(easy[0].id);
    expect(
      pickUnmasteredQuizQuestion(
        translationQuestions,
        'hard',
        translationQuestions.map((question) => question.id),
      ),
    ).toBeUndefined();
  });
});
