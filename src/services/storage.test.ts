import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  createDefaultState,
  parseImportedState,
  validateAndMigrateState,
} from './storage';

describe('app state storage', () => {
  it('uses the versioned root key', () => {
    expect(STORAGE_KEY).toBe('dutch-learning-hub:v1');
  });

  it('recovers safely from malformed nested data', () => {
    const state = validateAndMigrateState({
      version: 1,
      settings: { dailyGoal: 'many', defaultDifficulty: 'impossible' },
      progress: { totalXp: -10, questionHistory: [null, { id: 2 }] },
      review: { items: [null] },
    });

    expect(state.settings.dailyGoal).toBe(20);
    expect(state.settings.defaultDifficulty).toBe('easy');
    expect(state.progress.totalXp).toBe(0);
    expect(state.progress.questionHistory).toEqual([]);
    expect(state.review.items).toEqual([]);
  });

  it('round-trips a valid exported state', () => {
    const state = createDefaultState();
    expect(parseImportedState(JSON.stringify(state))).toEqual(state);
  });

  it('rejects unrelated JSON imports', () => {
    expect(() => parseImportedState('{"hello":"world"}')).toThrow(
      'not a Dutch Learning Hub progress file',
    );
  });
});
