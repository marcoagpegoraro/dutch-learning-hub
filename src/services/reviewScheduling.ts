import type { ReviewItem } from '../types/progress';

export type ReviewOutcome = 'again' | 'correct' | 'known';

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

export function updateReviewSchedule(
  items: ReviewItem[],
  itemId: string,
  outcome: ReviewOutcome,
  now = new Date(),
): ReviewItem[] {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) return items;
  if (outcome === 'known') return items.filter((candidate) => candidate.id !== itemId);

  if (outcome === 'again') {
    const due = new Date(now);
    due.setMinutes(due.getMinutes() + 10);
    return items.map((candidate) =>
      candidate.id === itemId ? { ...candidate, stage: 0, dueAt: due.toISOString() } : candidate,
    );
  }

  const nextStage = item.stage + 1;
  if (nextStage > REVIEW_INTERVAL_DAYS.length) {
    return items.filter((candidate) => candidate.id !== itemId);
  }
  const due = new Date(now);
  due.setDate(due.getDate() + REVIEW_INTERVAL_DAYS[nextStage - 1]);
  return items.map((candidate) =>
    candidate.id === itemId
      ? { ...candidate, stage: nextStage, dueAt: due.toISOString() }
      : candidate,
  );
}
