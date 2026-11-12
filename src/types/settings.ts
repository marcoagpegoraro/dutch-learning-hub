import type { Difficulty } from './exercise';

export type ClockType = 'analog' | 'digital' | 'random';

export interface AppSettings {
  defaultDifficulty: Difficulty;
  clockType: ClockType;
  showHints: boolean;
  soundEnabled: boolean;
  dutchVoiceURI: string;
  reducedMotion: boolean;
  dailyGoal: number;
}

export interface UserProfile {
  displayName: string;
  joinedAt: string;
}
