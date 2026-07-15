/* eslint-disable react-refresh/only-export-components -- provider and its hook form one public API */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { completeActivity, recordAttempt, type AttemptInput } from '../services/progress';
import { getUnlockedAchievementIds } from '../data/achievements';
import { updateReviewSchedule, type ReviewOutcome } from '../services/reviewScheduling';
import {
  createDefaultState,
  loadAppState,
  parseImportedState,
  saveAppState,
} from '../services/storage';
import type { AppState } from '../types/progress';
import type { AppSettings } from '../types/settings';

interface AppStateContextValue {
  state: AppState;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateDisplayName: (name: string) => void;
  addAttempt: (attempt: AttemptInput) => void;
  completeActivity: (activityId: string, xp?: number) => void;
  reviewMistake: (itemId: string, outcome: ReviewOutcome) => void;
  resetState: () => void;
  importState: (json: string) => void;
  exportState: () => string;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadAppState);

  useEffect(() => {
    saveAppState(state);
    document.documentElement.dataset.reducedMotion = String(state.settings.reducedMotion);
  }, [state]);

  useEffect(() => {
    const unlocked = getUnlockedAchievementIds(state);
    if (unlocked.some((id) => !state.progress.achievements.includes(id))) {
      setState((current) => ({
        ...current,
        progress: {
          ...current.progress,
          achievements: Array.from(new Set([...current.progress.achievements, ...unlocked])),
        },
      }));
    }
  }, [state]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      updateSettings: (settings) =>
        setState((current) => ({
          ...current,
          settings: { ...current.settings, ...settings },
        })),
      updateDisplayName: (displayName) =>
        setState((current) => ({
          ...current,
          profile: { ...current.profile, displayName: displayName.trim().slice(0, 80) },
        })),
      addAttempt: (attempt) => setState((current) => recordAttempt(current, attempt)),
      completeActivity: (activityId, xp) =>
        setState((current) => completeActivity(current, activityId, xp)),
      reviewMistake: (itemId, outcome) =>
        setState((current) => ({
          ...current,
          review: {
            items: updateReviewSchedule(current.review.items, itemId, outcome),
          },
        })),
      resetState: () => setState(createDefaultState()),
      importState: (json) => setState(parseImportedState(json)),
      exportState: () => JSON.stringify(state, null, 2),
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
