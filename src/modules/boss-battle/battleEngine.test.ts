import { describe, expect, it } from 'vitest';
import { applyBattleAnswer } from './battleEngine';

describe('boss battle engine', () => {
  it('deals bonus damage on each third consecutive answer', () => {
    const turn = applyBattleAnswer({ bossHealth: 5, playerHealth: 4, streak: 2 }, true);
    expect(turn.bossDamage).toBe(2);
    expect(turn.next).toEqual({ bossHealth: 3, playerHealth: 4, streak: 3 });
  });
  it('resets the streak and removes a heart after a mistake', () => {
    const turn = applyBattleAnswer({ bossHealth: 5, playerHealth: 4, streak: 2 }, false);
    expect(turn.next).toEqual({ bossHealth: 5, playerHealth: 3, streak: 0 });
  });
});
