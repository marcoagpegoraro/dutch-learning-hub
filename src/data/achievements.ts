import type { AppState } from '../types/progress';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'practice' | 'course' | 'consistency' | 'challenge';
  unlocked: (state: AppState) => boolean;
}

const attemptsInModules = (state: AppState) =>
  Object.values(state.progress.moduleStats).filter((stat) => stat.attempted > 0).length;
const courseCheckpoints = (state: AppState) =>
  state.progress.completedLessons.filter(
    (id) => id.startsWith('course:') && id.endsWith(':checkpoint'),
  ).length;
const bosses = (state: AppState) =>
  state.progress.completedLessons.filter((id) => id.startsWith('boss:defeated:')).length;

export const achievements: Achievement[] = [
  {
    id: 'first-answer',
    title: 'First step',
    description: 'Answer your first question.',
    icon: 'bi-shoe-prints',
    category: 'practice',
    unlocked: (s) => s.progress.questionHistory.length >= 1,
  },
  {
    id: 'questions-10',
    title: 'Warming up',
    description: 'Answer 10 questions.',
    icon: 'bi-check2-circle',
    category: 'practice',
    unlocked: (s) => s.progress.questionHistory.length >= 10,
  },
  {
    id: 'questions-50',
    title: 'Practice makes progress',
    description: 'Answer 50 questions.',
    icon: 'bi-stars',
    category: 'practice',
    unlocked: (s) => s.progress.questionHistory.length >= 50,
  },
  {
    id: 'xp-100',
    title: 'XP collector',
    description: 'Earn 100 XP.',
    icon: 'bi-lightning-charge',
    category: 'practice',
    unlocked: (s) => s.progress.totalXp >= 100,
  },
  {
    id: 'xp-500',
    title: 'XP champion',
    description: 'Earn 500 XP.',
    icon: 'bi-gem',
    category: 'practice',
    unlocked: (s) => s.progress.totalXp >= 500,
  },
  {
    id: 'explorer',
    title: 'Curious learner',
    description: 'Practise in 5 different modules.',
    icon: 'bi-compass',
    category: 'practice',
    unlocked: (s) => attemptsInModules(s) >= 5,
  },
  {
    id: 'streak-3',
    title: 'Three-day rhythm',
    description: 'Reach a 3-day streak.',
    icon: 'bi-fire',
    category: 'consistency',
    unlocked: (s) => s.progress.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Week of Dutch',
    description: 'Reach a 7-day streak.',
    icon: 'bi-calendar-check',
    category: 'consistency',
    unlocked: (s) => s.progress.longestStreak >= 7,
  },
  {
    id: 'course-unit',
    title: 'On the path',
    description: 'Complete your first course unit.',
    icon: 'bi-signpost-split',
    category: 'course',
    unlocked: (s) => courseCheckpoints(s) >= 1,
  },
  {
    id: 'course-half',
    title: 'Halfway there',
    description: 'Complete 8 course units.',
    icon: 'bi-map',
    category: 'course',
    unlocked: (s) => courseCheckpoints(s) >= 8,
  },
  {
    id: 'course-graduate',
    title: 'A1 course graduate',
    description: 'Complete all 16 A1 units.',
    icon: 'bi-mortarboard',
    category: 'course',
    unlocked: (s) => courseCheckpoints(s) >= 16,
  },
  {
    id: 'boss-first',
    title: 'Boss breaker',
    description: 'Defeat your first grammar boss.',
    icon: 'bi-shield-check',
    category: 'challenge',
    unlocked: (s) => bosses(s) >= 1,
  },
  {
    id: 'boss-all',
    title: 'Grammar hero',
    description: 'Defeat all three grammar bosses.',
    icon: 'bi-trophy',
    category: 'challenge',
    unlocked: (s) => bosses(s) >= 3,
  },
];

export function getUnlockedAchievementIds(state: AppState): string[] {
  return achievements.filter((item) => item.unlocked(state)).map((item) => item.id);
}
