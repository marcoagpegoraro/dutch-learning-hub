import { localDateKey } from './progress';
import type { AppState } from '../types/progress';

export interface DailySummary {
  xp: number;
  questions: number;
  correct: number;
  accuracy: number;
  goals: Array<{ id: string; label: string; value: number; target: number; complete: boolean }>;
  completedGoals: number;
}

export function getDailySummary(state: AppState, date = new Date()): DailySummary {
  const day = localDateKey(date);
  const attempts = state.progress.questionHistory.filter(
    (attempt) => localDateKey(new Date(attempt.answeredAt)) === day,
  );
  const rewardXp = state.progress.activityRewards
    .filter((reward) => localDateKey(new Date(reward.earnedAt)) === day)
    .reduce((sum, reward) => sum + reward.xpEarned, 0);
  const xp = attempts.reduce((sum, attempt) => sum + attempt.xpEarned, rewardXp);
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  const goals = [
    {
      id: 'xp',
      label: 'Earn XP',
      value: xp,
      target: state.settings.dailyGoal,
      complete: xp >= state.settings.dailyGoal,
    },
    {
      id: 'questions',
      label: 'Answer questions',
      value: attempts.length,
      target: 10,
      complete: attempts.length >= 10,
    },
    {
      id: 'accuracy',
      label: 'Keep 80% accuracy (5+ answers)',
      value: accuracy,
      target: 80,
      complete: attempts.length >= 5 && accuracy >= 80,
    },
  ];
  return {
    xp,
    questions: attempts.length,
    correct,
    accuracy,
    goals,
    completedGoals: goals.filter((goal) => goal.complete).length,
  };
}
