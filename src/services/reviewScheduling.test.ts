import { describe, expect, it } from 'vitest';
import type { ReviewItem } from '../types/progress';
import { updateReviewSchedule } from './reviewScheduling';

const now = new Date('2026-07-15T10:00:00.000Z');
const item: ReviewItem = {
  id: 'review-1',
  questionId: 'q1',
  moduleId: 'articles',
  prompt: '___ huis',
  correctAnswer: 'het',
  lastWrongAt: now.toISOString(),
  dueAt: now.toISOString(),
  wrongCount: 1,
  stage: 0,
};

describe('review scheduling', () => {
  it('returns an incorrect item in ten minutes', () => {
    const [updated] = updateReviewSchedule([item], item.id, 'again', now);
    expect(updated.stage).toBe(0);
    expect(updated.dueAt).toBe('2026-07-15T10:10:00.000Z');
  });

  it('advances correct reviews through increasing intervals', () => {
    const [dayOne] = updateReviewSchedule([item], item.id, 'correct', now);
    expect(dayOne.stage).toBe(1);
    expect(dayOne.dueAt).toBe('2026-07-16T10:00:00.000Z');
    const [dayThree] = updateReviewSchedule([dayOne], item.id, 'correct', now);
    expect(dayThree.stage).toBe(2);
    expect(dayThree.dueAt).toBe('2026-07-18T10:00:00.000Z');
  });

  it('removes items marked as known', () => {
    expect(updateReviewSchedule([item], item.id, 'known', now)).toEqual([]);
  });

  it('removes a mastered item after the final interval', () => {
    expect(updateReviewSchedule([{ ...item, stage: 5 }], item.id, 'correct', now)).toEqual([]);
  });
});
