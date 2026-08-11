import { describe, expect, it } from 'vitest';
import { createNumberQuestion, createNumberQuestionScheduler } from './numberQuestions';

describe('number question scheduler', () => {
  it('generates fresh numbers after correct answers', () => {
    const scheduler = createNumberQuestionScheduler(() => 0);
    const first = scheduler.next('easy');
    const second = scheduler.next('easy', { previousQuestion: first, wasCorrect: true });
    const third = scheduler.next('easy', { previousQuestion: second, wasCorrect: true });

    expect([first.id, second.id, third.id]).toEqual([
      'numbers-easy-0',
      'numbers-easy-1',
      'numbers-easy-2',
    ]);
  });

  it('brings a missed number back only after two other questions', () => {
    const scheduler = createNumberQuestionScheduler(() => 0);
    const first = scheduler.next('easy');
    const second = scheduler.next('easy', { previousQuestion: first, wasCorrect: false });
    const third = scheduler.next('easy', { previousQuestion: second, wasCorrect: true });
    const retry = scheduler.next('easy', { previousQuestion: third, wasCorrect: true });

    expect(first.id).toBe('numbers-easy-0');
    expect(second.id).toBe('numbers-easy-1');
    expect(third.id).toBe('numbers-easy-2');
    expect(retry.id).toBe(first.id);
  });

  it('creates text questions for newly generated larger numbers', () => {
    const question = createNumberQuestion(347, 'hard');
    expect(question).toMatchObject({
      id: 'numbers-hard-347',
      type: 'text',
      acceptedAnswers: expect.arrayContaining(['driehonderdzevenenveertig']),
    });
  });
});
