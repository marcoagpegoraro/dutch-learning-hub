import { describe, expect, it } from 'vitest';
import { createDefaultState } from './storage';
import { getDailySummary } from './dailyGoals';

describe('daily goals', () => {
  it('only counts attempts from the requested local day', () => {
    const state = createDefaultState();
    state.progress.questionHistory = [
      {
        id: '1',
        questionId: 'q1',
        moduleId: 'time',
        difficulty: 'easy',
        prompt: '',
        submittedAnswer: '',
        correctAnswer: '',
        correct: true,
        xpEarned: 12,
        answeredAt: '2026-07-15T09:00:00',
      },
      {
        id: '2',
        questionId: 'q2',
        moduleId: 'time',
        difficulty: 'easy',
        prompt: '',
        submittedAnswer: '',
        correctAnswer: '',
        correct: false,
        xpEarned: 0,
        answeredAt: '2026-07-14T09:00:00',
      },
    ];
    state.progress.activityRewards = [
      { id: 'lesson', xpEarned: 5, earnedAt: '2026-07-15T10:00:00' },
    ];
    const summary = getDailySummary(state, new Date(2026, 6, 15));
    expect(summary.questions).toBe(1);
    expect(summary.xp).toBe(17);
    expect(summary.accuracy).toBe(100);
  });
});
