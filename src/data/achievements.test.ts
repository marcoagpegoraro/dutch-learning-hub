import { describe, expect, it } from 'vitest';
import { createDefaultState } from '../services/storage';
import { getUnlockedAchievementIds } from './achievements';

describe('achievements', () => {
  it('unlocks persisted activity milestones', () => {
    const state = createDefaultState();
    state.progress.totalXp = 100;
    state.progress.completedLessons = [
      'course:greetings:checkpoint',
      'boss:defeated:word-order-warden',
    ];
    const ids = getUnlockedAchievementIds(state);
    expect(ids).toContain('xp-100');
    expect(ids).toContain('course-unit');
    expect(ids).toContain('boss-first');
  });
});
