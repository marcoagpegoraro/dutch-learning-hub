import type { Difficulty } from '../types/exercise';

const BASE_XP: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

export function calculateXp(
  difficulty: Difficulty,
  options: { correct: boolean; firstAttempt?: boolean; streak?: number; revealed?: boolean },
): number {
  if (!options.correct) return 0;

  let xp = BASE_XP[difficulty];
  if (options.firstAttempt !== false) xp += 2;
  if ((options.streak ?? 0) >= 5) xp += 3;
  if (options.revealed) xp = Math.max(1, Math.floor(xp / 2));
  return xp;
}
