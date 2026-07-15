import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from './quizUtils';
import { answersForQuestion, isQuizAnswerCorrect, pickQuizQuestion } from './quizUtils';

const questions: QuizQuestion[] = [
  {
    id: 'easy-1',
    moduleId: 'test',
    difficulty: 'easy',
    type: 'multiple-choice',
    prompt: 'Choose',
    options: ['de', 'het'],
    correctOption: 'het',
    tags: [],
  },
  {
    id: 'easy-2',
    moduleId: 'test',
    difficulty: 'easy',
    type: 'text',
    prompt: 'Type',
    acceptedAnswers: ['kwart over elf', 'vijftien over elf'],
    tags: [],
  },
  {
    id: 'hard-1',
    moduleId: 'test',
    difficulty: 'hard',
    type: 'text',
    prompt: 'Type',
    acceptedAnswers: ['antwoord'],
    tags: [],
  },
];

describe('shared quiz behavior', () => {
  it('extracts answers for both supported question types', () => {
    expect(answersForQuestion(questions[0])).toEqual(['het']);
    expect(answersForQuestion(questions[1])).toEqual(['kwart over elf', 'vijftien over elf']);
  });

  it('checks configured answers using shared normalization', () => {
    expect(isQuizAnswerCorrect(questions[1], '  VIJFTIEN over elf. ')).toBe(true);
    expect(isQuizAnswerCorrect(questions[0], 'de')).toBe(false);
  });

  it('avoids immediately repeating a question when alternatives exist', () => {
    expect(pickQuizQuestion(questions, 'easy', 'easy-1', () => 0).id).toBe('easy-2');
  });
});
