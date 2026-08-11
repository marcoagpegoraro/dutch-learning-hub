import type { ExerciseDifficulty } from '../../types/exercise';
import type { QuizQuestion } from '../shared/quizUtils';
import { numberToDutch, numberToDutchSpaced } from './numberWords';

interface SchedulerContext {
  previousQuestion?: QuizQuestion;
  wasCorrect?: boolean;
}

interface NumberRange {
  min: number;
  max: number;
}

interface Retry {
  value: number;
  readyAt: number;
}

interface DifficultySchedule {
  shown: Set<number>;
  retries: Retry[];
  turns: number;
}

type NumberDifficulty = ExerciseDifficulty;

const ranges: Record<NumberDifficulty, NumberRange> = {
  easy: { min: 0, max: 20 },
  medium: { min: 21, max: 100 },
  hard: { min: 101, max: 9999 },
  'very-hard': { min: 10_000, max: 10_000_000 },
};

const retryDelay = 2;

function formattedNumber(value: number): string {
  return value.toLocaleString('nl-NL');
}

function numberFromQuestion(question: QuizQuestion | undefined): number | null {
  if (!question?.id.startsWith('numbers-')) return null;
  const value = Number(question.id.split('-').at(-1));
  return Number.isInteger(value) ? value : null;
}

function difficultyFromQuestion(question: QuizQuestion | undefined): NumberDifficulty | null {
  if (!question?.id.startsWith('numbers-')) return null;
  if (question.id.startsWith('numbers-very-hard-')) return 'very-hard';
  return question.difficulty;
}

function createEasyQuestion(value: number, random: () => number): QuizQuestion {
  const distractors: number[] = [];
  const candidates = Array.from({ length: 21 }, (_, index) => index).filter(
    (candidate) => candidate !== value,
  );
  while (distractors.length < 3) {
    const index = Math.floor(random() * candidates.length);
    distractors.push(candidates.splice(index, 1)[0]);
  }
  const correctOption = numberToDutch(value);
  return {
    id: `numbers-easy-${value}`,
    moduleId: 'numbers',
    difficulty: 'easy',
    type: 'multiple-choice',
    prompt: `Which Dutch word means ${value}?`,
    options: [correctOption, ...distractors.map(numberToDutch)].sort(),
    correctOption,
    hint: 'Say the number slowly and compare each option.',
    explanation: `${value} is ${correctOption} in Dutch.`,
    tags: ['0–20', 'recognition'],
  };
}

export function createNumberQuestion(
  value: number,
  difficulty: NumberDifficulty,
  random: () => number = Math.random,
): QuizQuestion {
  if (difficulty === 'easy') return createEasyQuestion(value, random);
  const dutch = numberToDutch(value);
  const spaced = numberToDutchSpaced(value);
  return {
    id: `numbers-${difficulty}-${value}`,
    moduleId: 'numbers',
    difficulty: difficulty === 'very-hard' ? 'hard' : difficulty,
    type: 'text',
    prompt: `Write ${formattedNumber(value)} in Dutch words.`,
    acceptedAnswers: [dutch, spaced, spaced.replaceAll(' ', '-')],
    hint:
      difficulty === 'medium'
        ? 'Dutch puts the unit before the tens: vier-en-twintig.'
        : difficulty === 'very-hard'
          ? 'Build millions, thousands, hundreds, then the final two-digit number.'
          : 'Build thousands, hundreds, then the final two-digit number.',
    explanation: `${formattedNumber(value)} is written ${dutch}. Dutch number words are normally written together.`,
    tags: [
      difficulty === 'medium'
        ? '21–100'
        : difficulty === 'very-hard'
          ? 'ten-thousands & millions'
          : 'hundreds & thousands',
      'normalize-hyphens',
    ],
  };
}

function pickNewValue(range: NumberRange, shown: Set<number>, random: () => number): number {
  const capacity = range.max - range.min + 1;
  if (shown.size >= capacity) shown.clear();

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const value = range.min + Math.floor(random() * capacity);
    if (!shown.has(value)) return value;
  }

  for (let value = range.min; value <= range.max; value += 1) {
    if (!shown.has(value)) return value;
  }
  return range.min;
}

export function createNumberQuestionScheduler(random: () => number = Math.random) {
  const schedules: Record<NumberDifficulty, DifficultySchedule> = {
    easy: { shown: new Set(), retries: [], turns: 0 },
    medium: { shown: new Set(), retries: [], turns: 0 },
    hard: { shown: new Set(), retries: [], turns: 0 },
    'very-hard': { shown: new Set(), retries: [], turns: 0 },
  };

  return {
    next(difficulty: NumberDifficulty, context: SchedulerContext = {}): QuizQuestion {
      const previousDifficulty = difficultyFromQuestion(context.previousQuestion);
      const previousValue = numberFromQuestion(context.previousQuestion);
      if (context.wasCorrect === false && previousDifficulty && previousValue !== null) {
        const previousSchedule = schedules[previousDifficulty];
        previousSchedule.retries = previousSchedule.retries.filter(
          (retry) => retry.value !== previousValue,
        );
        previousSchedule.retries.push({
          value: previousValue,
          readyAt: previousSchedule.turns + retryDelay + 1,
        });
      }

      const schedule = schedules[difficulty];
      schedule.turns += 1;
      const retryIndex = schedule.retries.findIndex((retry) => retry.readyAt <= schedule.turns);
      const value =
        retryIndex >= 0
          ? schedule.retries.splice(retryIndex, 1)[0].value
          : pickNewValue(ranges[difficulty], schedule.shown, random);
      schedule.shown.add(value);
      return createNumberQuestion(value, difficulty, random);
    },
  };
}
