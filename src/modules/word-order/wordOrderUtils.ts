import { normalizeAnswer } from '../../services/answerNormalization';
import type { Difficulty, OrderingQuestion } from '../../types/exercise';

export function isCorrectWordOrder(answer: string[], correctOrder: string[]): boolean {
  return normalizeAnswer(answer.join(' ')) === normalizeAnswer(correctOrder.join(' '));
}

export function pickOrderingQuestion(
  questions: OrderingQuestion[],
  difficulty: Difficulty,
  previousId?: string,
  random: () => number = Math.random,
): OrderingQuestion {
  const matching = questions.filter((question) => question.difficulty === difficulty);
  const candidates =
    matching.length > 1 ? matching.filter((question) => question.id !== previousId) : matching;
  return candidates[Math.floor(random() * candidates.length)];
}
