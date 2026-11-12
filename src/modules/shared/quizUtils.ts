import { evaluateAcceptedAnswer, isAcceptedAnswer } from '../../services/answerNormalization';
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

export function evaluateQuizAnswer(question: QuizQuestion, answer: string) {
  return evaluateAcceptedAnswer(answer, answersForQuestion(question), {
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

// A finite practice queue never falls back to another difficulty when this one is finished.
export function remainingQuizQuestions(
  questions: QuizQuestion[],
  difficulty: Difficulty,
  masteredIds: readonly string[],
): QuizQuestion[] {
  const mastered = new Set(masteredIds);
  return questions.filter(
    (question) => question.difficulty === difficulty && !mastered.has(question.id),
  );
}

export function pickUnmasteredQuizQuestion(
  questions: QuizQuestion[],
  difficulty: Difficulty,
  masteredIds: readonly string[],
  previousId?: string,
  random: () => number = Math.random,
): QuizQuestion | undefined {
  const remaining = remainingQuizQuestions(questions, difficulty, masteredIds);
  const candidates =
    remaining.length > 1 ? remaining.filter((question) => question.id !== previousId) : remaining;
  return candidates[Math.floor(random() * candidates.length)];
}
