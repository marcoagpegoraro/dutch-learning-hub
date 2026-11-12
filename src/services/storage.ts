import { createWordListsState } from '../modules/word-lists/wordListEngine';
import { loadCustomWordLists, sanitizeWordListsState } from '../modules/word-lists/wordListStorage';
import type { Difficulty } from '../types/exercise';
import type {
  AppState,
  ModuleProgress,
  ProgressState,
  QuestionAttempt,
  ReviewItem,
} from '../types/progress';
import type { AppSettings } from '../types/settings';

export const STORAGE_KEY = 'dutch-learning-hub:v1';
export const APP_STATE_VERSION = 1 as const;

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

function todayIso(): string {
  return new Date().toISOString();
}

export function createDefaultSettings(): AppSettings {
  return {
    defaultDifficulty: 'easy',
    clockType: 'analog',
    showHints: false,
    soundEnabled: true,
    dutchVoiceURI: '',
    reducedMotion: false,
    dailyGoal: 20,
  };
}

export function createDefaultProgress(): ProgressState {
  return {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    moduleStats: {},
    difficultyStats: {
      easy: { correct: 0, attempted: 0 },
      medium: { correct: 0, attempted: 0 },
      hard: { correct: 0, attempted: 0 },
    },
    completedLessons: [],
    questionHistory: [],
    masteredItems: [],
    achievements: [],
    activityRewards: [],
  };
}

export function createDefaultState(): AppState {
  return {
    version: APP_STATE_VERSION,
    wordLists: createWordListsState(),
    profile: { displayName: 'Dutch learner', joinedAt: todayIso() },
    progress: createDefaultProgress(),
    review: { items: [] },
    settings: createDefaultSettings(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNonNegative(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function sanitizeSettings(value: unknown): AppSettings {
  const defaults = createDefaultSettings();
  if (!isRecord(value)) return defaults;
  const difficulty = difficulties.includes(value.defaultDifficulty as Difficulty)
    ? (value.defaultDifficulty as Difficulty)
    : defaults.defaultDifficulty;
  const clockTypes = ['analog', 'digital', 'random'] as const;
  const clockType = clockTypes.includes(value.clockType as (typeof clockTypes)[number])
    ? (value.clockType as AppSettings['clockType'])
    : defaults.clockType;

  return {
    defaultDifficulty: difficulty,
    clockType,
    showHints: typeof value.showHints === 'boolean' ? value.showHints : defaults.showHints,
    soundEnabled:
      typeof value.soundEnabled === 'boolean' ? value.soundEnabled : defaults.soundEnabled,
    dutchVoiceURI: typeof value.dutchVoiceURI === 'string' ? value.dutchVoiceURI.slice(0, 500) : '',
    reducedMotion:
      typeof value.reducedMotion === 'boolean' ? value.reducedMotion : defaults.reducedMotion,
    dailyGoal: Math.min(100, Math.max(5, finiteNonNegative(value.dailyGoal, defaults.dailyGoal))),
  };
}

function sanitizeProgress(value: unknown): ProgressState {
  const defaults = createDefaultProgress();
  if (!isRecord(value)) return defaults;
  const difficultyStats = isRecord(value.difficultyStats) ? value.difficultyStats : {};

  return {
    ...defaults,
    totalXp: finiteNonNegative(value.totalXp),
    currentStreak: finiteNonNegative(value.currentStreak),
    longestStreak: finiteNonNegative(value.longestStreak),
    lastActiveDate: typeof value.lastActiveDate === 'string' ? value.lastActiveDate : undefined,
    moduleStats: sanitizeModuleStats(value.moduleStats),
    difficultyStats: Object.fromEntries(
      difficulties.map((difficulty) => {
        const stat = isRecord(difficultyStats[difficulty]) ? difficultyStats[difficulty] : {};
        return [
          difficulty,
          {
            correct: finiteNonNegative(stat.correct),
            attempted: finiteNonNegative(stat.attempted),
          },
        ];
      }),
    ) as ProgressState['difficultyStats'],
    completedLessons: Array.isArray(value.completedLessons)
      ? value.completedLessons.filter((item): item is string => typeof item === 'string')
      : [],
    questionHistory: sanitizeQuestionHistory(value.questionHistory),
    masteredItems: Array.from(
      new Set([
        ...(Array.isArray(value.masteredItems)
          ? value.masteredItems.filter((item): item is string => typeof item === 'string')
          : []),
        ...sanitizeQuestionHistory(value.questionHistory)
          .filter(
            (attempt) =>
              ['translation', 'questions-answers'].includes(attempt.moduleId) && attempt.correct,
          )
          .map((attempt) => attempt.questionId),
      ]),
    ),
    achievements: Array.isArray(value.achievements)
      ? value.achievements.filter((item): item is string => typeof item === 'string')
      : [],
    activityRewards: Array.isArray(value.activityRewards)
      ? value.activityRewards
          .filter(
            (item): item is Record<string, unknown> =>
              isRecord(item) && typeof item.id === 'string' && typeof item.earnedAt === 'string',
          )
          .map((item) => ({
            id: item.id as string,
            xpEarned: finiteNonNegative(item.xpEarned),
            earnedAt: item.earnedAt as string,
          }))
          .slice(-250)
      : [],
  };
}

function sanitizeModuleStats(value: unknown): Record<string, ModuleProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, stat]) => isRecord(stat))
      .map(([moduleId, stat]) => {
        const safeStat = stat as Record<string, unknown>;
        return [
          moduleId,
          {
            correct: finiteNonNegative(safeStat.correct),
            attempted: finiteNonNegative(safeStat.attempted),
            xp: finiteNonNegative(safeStat.xp),
            currentStreak: finiteNonNegative(safeStat.currentStreak),
            bestStreak: finiteNonNegative(safeStat.bestStreak),
            lastPracticedAt:
              typeof safeStat.lastPracticedAt === 'string' ? safeStat.lastPracticedAt : undefined,
          },
        ];
      }),
  );
}

function sanitizeQuestionHistory(value: unknown): QuestionAttempt[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((attempt): attempt is Record<string, unknown> => isRecord(attempt))
    .filter(
      (attempt) =>
        typeof attempt.id === 'string' &&
        typeof attempt.questionId === 'string' &&
        typeof attempt.moduleId === 'string' &&
        difficulties.includes(attempt.difficulty as Difficulty) &&
        typeof attempt.correct === 'boolean' &&
        typeof attempt.answeredAt === 'string',
    )
    .map((attempt) => ({
      id: attempt.id as string,
      questionId: attempt.questionId as string,
      moduleId: attempt.moduleId as string,
      difficulty: attempt.difficulty as Difficulty,
      prompt: typeof attempt.prompt === 'string' ? attempt.prompt : '',
      submittedAnswer: typeof attempt.submittedAnswer === 'string' ? attempt.submittedAnswer : '',
      correctAnswer: typeof attempt.correctAnswer === 'string' ? attempt.correctAnswer : '',
      correct: attempt.correct as boolean,
      xpEarned: finiteNonNegative(attempt.xpEarned),
      answeredAt: attempt.answeredAt as string,
    }))
    .slice(-250);
}

function sanitizeReviewItems(value: unknown): ReviewItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .filter(
      (item) =>
        typeof item.id === 'string' &&
        typeof item.questionId === 'string' &&
        typeof item.moduleId === 'string' &&
        typeof item.correctAnswer === 'string',
    )
    .map((item) => ({
      id: item.id as string,
      questionId: item.questionId as string,
      moduleId: item.moduleId as string,
      prompt: typeof item.prompt === 'string' ? item.prompt : '',
      correctAnswer: item.correctAnswer as string,
      lastWrongAt: typeof item.lastWrongAt === 'string' ? item.lastWrongAt : todayIso(),
      dueAt: typeof item.dueAt === 'string' ? item.dueAt : todayIso(),
      wrongCount: finiteNonNegative(item.wrongCount, 1),
      stage: finiteNonNegative(item.stage),
    }))
    .slice(-100);
}

export function validateAndMigrateState(value: unknown): AppState {
  const defaults = createDefaultState();
  if (!isRecord(value)) return defaults;

  // Version 1 is intentionally tolerant: known fields are retained and invalid fields reset.
  return {
    version: APP_STATE_VERSION,
    wordLists: sanitizeWordListsState(value.wordLists),
    profile: isRecord(value.profile)
      ? {
          displayName:
            typeof value.profile.displayName === 'string' && value.profile.displayName.trim()
              ? value.profile.displayName.slice(0, 80)
              : defaults.profile.displayName,
          joinedAt:
            typeof value.profile.joinedAt === 'string'
              ? value.profile.joinedAt
              : defaults.profile.joinedAt,
        }
      : defaults.profile,
    progress: sanitizeProgress(value.progress),
    review: isRecord(value.review)
      ? { items: sanitizeReviewItems(value.review.items) }
      : defaults.review,
    settings: sanitizeSettings(value.settings),
  };
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return createDefaultState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    const state = validateAndMigrateState(parsed);
    if (!isRecord(parsed) || !('wordLists' in parsed))
      state.wordLists.customLists = loadCustomWordLists();
    return state;
  } catch {
    return createDefaultState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A full or disabled localStorage should not stop a practice session.
  }
}

export function parseImportedState(json: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isRecord(parsed) || !('version' in parsed)) {
    throw new Error('This is not a Dutch Learning Hub progress file.');
  }
  return validateAndMigrateState(parsed);
}
