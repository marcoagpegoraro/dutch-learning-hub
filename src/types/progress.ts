import type { WordListsState } from '../modules/word-lists/wordListEngine';
import type { Difficulty } from './exercise';
import type { AppSettings, UserProfile } from './settings';

export interface AccuracyStat {
  correct: number;
  attempted: number;
}

export interface ModuleProgress extends AccuracyStat {
  xp: number;
  currentStreak: number;
  bestStreak: number;
  lastPracticedAt?: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  moduleId: string;
  difficulty: Difficulty;
  prompt: string;
  submittedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  xpEarned: number;
  answeredAt: string;
}

export interface ActivityReward {
  id: string;
  xpEarned: number;
  earnedAt: string;
}

export interface ProgressState {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  moduleStats: Record<string, ModuleProgress>;
  difficultyStats: Record<Difficulty, AccuracyStat>;
  completedLessons: string[];
  questionHistory: QuestionAttempt[];
  masteredItems: string[];
  achievements: string[];
  activityRewards: ActivityReward[];
}

export interface ReviewItem {
  id: string;
  questionId: string;
  moduleId: string;
  prompt: string;
  correctAnswer: string;
  lastWrongAt: string;
  dueAt: string;
  wrongCount: number;
  stage: number;
}

export interface ReviewState {
  items: ReviewItem[];
}

export interface AppState {
  version: 1;
  wordLists: WordListsState;
  profile: UserProfile;
  progress: ProgressState;
  review: ReviewState;
  settings: AppSettings;
}
