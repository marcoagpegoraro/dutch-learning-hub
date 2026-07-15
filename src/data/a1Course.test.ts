import { describe, expect, it } from 'vitest';
import {
  a1Course,
  courseCheckpointId,
  courseLessonId,
  courseUnitProgress,
  isCourseUnitUnlocked,
} from './a1Course';

describe('A1 course', () => {
  it('contains 16 ordered units with unique ids', () => {
    expect(a1Course).toHaveLength(16);
    expect(new Set(a1Course.map((unit) => unit.id)).size).toBe(16);
    expect(a1Course.map((unit) => unit.number)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1),
    );
  });
  it('unlocks units sequentially', () => {
    expect(isCourseUnitUnlocked(0, [])).toBe(true);
    expect(isCourseUnitUnlocked(1, [])).toBe(false);
    expect(isCourseUnitUnlocked(1, [courseCheckpointId(a1Course[0].id)])).toBe(true);
  });
  it('calculates lesson and checkpoint progress', () => {
    const first = a1Course[0];
    expect(courseUnitProgress(first, [])).toBe(0);
    expect(courseUnitProgress(first, [courseLessonId(first.id, first.lessons[0].id)])).toBe(33);
    expect(
      courseUnitProgress(first, [
        ...first.lessons.map((lesson) => courseLessonId(first.id, lesson.id)),
        courseCheckpointId(first.id),
      ]),
    ).toBe(100);
  });
});
