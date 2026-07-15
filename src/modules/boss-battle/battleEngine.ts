export interface BattleState {
  bossHealth: number;
  playerHealth: number;
  streak: number;
}
export interface BattleTurn {
  next: BattleState;
  bossDamage: number;
  playerDamage: number;
}

export function applyBattleAnswer(state: BattleState, correct: boolean): BattleTurn {
  if (correct) {
    const streak = state.streak + 1;
    const bossDamage = streak % 3 === 0 ? 2 : 1;
    return {
      bossDamage,
      playerDamage: 0,
      next: { ...state, bossHealth: Math.max(0, state.bossHealth - bossDamage), streak },
    };
  }
  return {
    bossDamage: 0,
    playerDamage: 1,
    next: { ...state, playerHealth: Math.max(0, state.playerHealth - 1), streak: 0 },
  };
}
