import { describe, expect, it } from 'vitest';
import { recommendA2Task } from './a2Recommendations';
import { createA2State, type A2Evidence } from './types';
import { taskId } from './a2Progress';
describe('A2 practice recommendations', () => {
  it('starts with the complete transport pilot', () => {
    expect(recommendA2Task(createA2State())).toMatchObject({
      unitId: 'transport',
      mode: 'practice',
      taskIndex: 0,
    });
  });
  it('prioritises a fresh retention task after 24 hours', () => {
    const item: A2Evidence = {
      id: '1',
      taskId: taskId('transport', 'check', 'reading', 0),
      unitId: 'transport',
      mode: 'check',
      skill: 'reading',
      sessionId: 'old',
      response: 'test',
      recordings: [],
      supports: [],
      answeredAt: '2026-11-12T10:00:00Z',
      source: 'objective',
      correct: true,
    };
    const state = {
      ...createA2State(),
      evidence: [item, { ...item, id: '2', taskId: taskId('transport', 'check', 'reading', 1) }],
    };
    expect(recommendA2Task(state, new Date('2026-11-14T12:00:00Z'))).toMatchObject({
      mode: 'review',
      taskIndex: 0,
    });
    expect(recommendA2Task(state, new Date('2026-11-12T12:00:00Z'))?.mode).toBe('practice');
  });
});
