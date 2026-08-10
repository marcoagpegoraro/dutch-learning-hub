import { describe, expect, it } from 'vitest';
import { isQuizAnswerCorrect } from '../shared/quizUtils';
import { bodyWords, buildBodyQuestions } from './bodyData';

describe('body vocabulary questions', () => {
  it('includes every supplied body word', () => {
    expect(bodyWords).toHaveLength(42);
  });

  it('requires the article when typing a Dutch body word', () => {
    const eye = buildBodyQuestions().find((question) => question.id === 'body-oog');
    expect(eye).toBeDefined();
    expect(isQuizAnswerCorrect(eye!, 'het oog')).toBe(true);
    expect(isQuizAnswerCorrect(eye!, 'oog')).toBe(false);
  });
});
