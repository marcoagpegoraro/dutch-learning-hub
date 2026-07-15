import type { Difficulty } from '../types/exercise';
import type { AppState, ModuleProgress, QuestionAttempt } from '../types/progress';

const emptyModuleProgress = (): ModuleProgress => ({
  correct: 0,
  attempted: 0,
  xp: 0,
  currentStreak: 0,
  bestStreak: 0,
});

export interface AttemptInput {
  questionId: string;
  moduleId: string;
  difficulty: Difficulty;
  prompt: string;
  submittedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  xpEarned: number;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function recordAttempt(state: AppState, input: AttemptInput): AppState {
  const previousModule = state.progress.moduleStats[input.moduleId] ?? emptyModuleProgress();
  const moduleStreak = input.correct ? previousModule.currentStreak + 1 : 0;
  const difficultyStat = state.progress.difficultyStats[input.difficulty];
  const now = new Date();
  const today = localDateKey(now);
  const yesterday = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const priorDay = state.progress.lastActiveDate;
  const dailyStreak =
    priorDay === today
      ? state.progress.currentStreak
      : priorDay === yesterday
        ? state.progress.currentStreak + 1
        : 1;
  const attempt: QuestionAttempt = {
    ...input,
    id: `${input.questionId}-${now.getTime()}`,
    answeredAt: now.toISOString(),
  };

  const reviewItems = input.correct
    ? state.review.items
    : [
        ...state.review.items.filter((item) => item.questionId !== input.questionId),
        {
          id: `review-${input.questionId}`,
          questionId: input.questionId,
          moduleId: input.moduleId,
          prompt: input.prompt,
          correctAnswer: input.correctAnswer,
          lastWrongAt: now.toISOString(),
          dueAt: now.toISOString(),
          wrongCount:
            (state.review.items.find((item) => item.questionId === input.questionId)?.wrongCount ??
              0) + 1,
          stage: 0,
        },
      ].slice(-100);

  return {
    ...state,
    progress: {
      ...state.progress,
      totalXp: state.progress.totalXp + input.xpEarned,
      currentStreak: dailyStreak,
      longestStreak: Math.max(state.progress.longestStreak, dailyStreak),
      lastActiveDate: today,
      moduleStats: {
        ...state.progress.moduleStats,
        [input.moduleId]: {
          correct: previousModule.correct + (input.correct ? 1 : 0),
          attempted: previousModule.attempted + 1,
          xp: previousModule.xp + input.xpEarned,
          currentStreak: moduleStreak,
          bestStreak: Math.max(previousModule.bestStreak, moduleStreak),
          lastPracticedAt: now.toISOString(),
        },
      },
      difficultyStats: {
        ...state.progress.difficultyStats,
        [input.difficulty]: {
          correct: difficultyStat.correct + (input.correct ? 1 : 0),
          attempted: difficultyStat.attempted + 1,
        },
      },
      questionHistory: [...state.progress.questionHistory, attempt].slice(-250),
    },
    review: { items: reviewItems },
  };
}

export function getAccuracy(correct: number, attempted: number): number {
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}

export function completeActivity(state: AppState, activityId: string, xp = 0): AppState {
  if (state.progress.completedLessons.includes(activityId)) return state;
  return {
    ...state,
    progress: {
      ...state.progress,
      totalXp: state.progress.totalXp + Math.max(0, xp),
      completedLessons: [...state.progress.completedLessons, activityId],
      activityRewards:
        xp > 0
          ? [
              ...state.progress.activityRewards,
              { id: activityId, xpEarned: xp, earnedAt: new Date().toISOString() },
            ].slice(-250)
          : state.progress.activityRewards,
    },
  };
}
