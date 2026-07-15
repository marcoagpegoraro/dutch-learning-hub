import { describe, expect, it } from 'vitest';
import { listeningItems, listeningQuestions, spokenTextForQuestion } from './listeningData';

describe('listening content', () => {
  it('provides five questions at each difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(
        listeningQuestions.filter((question) => question.difficulty === difficulty),
      ).toHaveLength(5);
    }
  });

  it('keeps spoken text out of learner prompts while retaining an answer', () => {
    for (const item of listeningItems) {
      expect(item.question.prompt).not.toContain(item.spokenText);
      expect(spokenTextForQuestion(item.question.id)).toBe(item.spokenText);
      if (item.question.type === 'text')
        expect(item.question.acceptedAnswers.length).toBeGreaterThan(0);
      if (item.question.type === 'multiple-choice')
        expect(item.question.options).toContain(item.question.correctOption);
    }
  });
});
