import { isAcceptedAnswer } from '../../services/answerNormalization';
import type { Difficulty, MultipleChoiceQuestion, TextQuestion } from '../../types/exercise';

export type QuizQuestion = TextQuestion | MultipleChoiceQuestion;

export function answersForQuestion(question: QuizQuestion): string[] {
  return question.type === 'text' ? question.acceptedAnswers : [question.correctOption];
}

export function isQuizAnswerCorrect(question: QuizQuestion, answer: string): boolean {
  return isAcceptedAnswer(answer, answersForQuestion(question), {
    normalizeHyphens: question.tags.includes('normalize-hyphens'),
  });
}

export function questionsForDifficulty(
  questions: QuizQuestion[],
  difficulty: Difficulty,
): QuizQuestion[] {
  const matching = questions.filter((question) => question.difficulty === difficulty);
  return matching.length ? matching : questions;
}

export function pickQuizQuestion(
  questions: QuizQuestion[],
  difficulty: Difficulty,
  previousId?: string,
  random: () => number = Math.random,
): QuizQuestion {
  const matching = questionsForDifficulty(questions, difficulty);
  const candidates =
    matching.length > 1 ? matching.filter((question) => question.id !== previousId) : matching;
  return candidates[Math.floor(random() * candidates.length)];
}
