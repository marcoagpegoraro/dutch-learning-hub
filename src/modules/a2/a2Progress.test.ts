import { describe, expect, it } from 'vitest';
import {
  addA2Evidence,
  importTeacherReviews,
  newA2Draft,
  sanitizeA2State,
  skillStatus,
  taskId,
} from './a2Progress';
import { createA2State, type A2Evidence } from './types';
import {
  createDefaultState,
  parseImportedState,
  validateAndMigrateState,
} from '../../services/storage';
const evidence = (changes: Partial<A2Evidence> = {}): A2Evidence => ({
  id: 'one',
  taskId: taskId('transport', 'check', 'writing'),
  unitId: 'transport',
  mode: 'check',
  skill: 'writing',
  sessionId: 'session-1',
  response: 'Mijn trein is laat.',
  recordings: [],
  supports: [],
  answeredAt: '2026-11-12T10:00:00Z',
  source: 'self',
  rubric: [3, 3, 3, 3],
  ...changes,
});
const now = new Date('2026-11-16T12:00:00Z');
describe('A2 evidence and skill progression', () => {
  it('never promotes self-assessment, even with perfect scores', () => {
    let state = createA2State();
    expect(skillStatus(state, 'writing', 'transport', now)).toBe('unpractised');
    state = addA2Evidence(state, evidence());
    expect(skillStatus(state, 'writing', 'transport', now)).toBe('practised');
    expect(addA2Evidence(state, evidence())).toBe(state);
  });
  it('requires a complete imported manual review for an open response', () => {
    let state = addA2Evidence(createA2State(), evidence());
    state = importTeacherReviews(state, {
      kind: 'dutch-hub-a2-reviews',
      version: 1,
      reviews: [
        {
          evidenceId: 'one',
          reviewer: 'Docent',
          scores: [2, 2, 2, 2],
          comment: 'Begrijpelijk.',
          reviewedAt: '2026-11-13T12:00:00Z',
        },
      ],
    });
    expect(skillStatus(state, 'writing', 'transport', now)).toBe('demonstrated');
    expect(() =>
      importTeacherReviews(state, {
        kind: 'dutch-hub-a2-reviews',
        version: 1,
        reviews: [
          {
            evidenceId: 'unknown',
            reviewer: 'Docent',
            scores: [2, 2, 2, 2],
            reviewedAt: '2026-11-13T12:00:00Z',
          },
        ],
      }),
    ).toThrow('desconhecidas');
    expect(() =>
      importTeacherReviews(state, {
        kind: 'dutch-hub-a2-reviews',
        version: 1,
        reviews: [
          {
            evidenceId: 'one',
            reviewer: 'Docent',
            scores: [9, 2, 2, 2],
            reviewedAt: '2026-11-13T12:00:00Z',
          },
        ],
      }),
    ).toThrow();
  });
  it('does not promote assisted responses or practiced versions after teacher review', () => {
    for (const changes of [
      { supports: ['transcrição consultada'] },
      { mode: 'practice' as const },
    ]) {
      const item = evidence(changes);
      const state = {
        ...createA2State(),
        evidence: [item],
        teacherReviews: [
          {
            evidenceId: item.id,
            reviewer: 'Docent',
            scores: [3, 3, 3, 3],
            comment: '',
            reviewedAt: '2026-11-13T12:00:00Z',
          },
        ],
      };
      expect(skillStatus(state, 'writing', 'transport', now)).toBe('practised');
    }
  });
  it('requires two distinct comprehension sources instead of repeated answers to the same source', () => {
    const first = evidence({
      skill: 'reading',
      source: 'objective',
      correct: true,
      taskId: taskId('transport', 'check', 'reading', 0),
    });
    let state = { ...createA2State(), evidence: [first, { ...first, id: 'duplicate' }] };
    expect(skillStatus(state, 'reading', 'transport', now)).toBe('practised');
    state = addA2Evidence(state, {
      ...first,
      id: 'second',
      taskId: taskId('transport', 'check', 'reading', 1),
    });
    expect(skillStatus(state, 'reading', 'transport', now)).toBe('demonstrated');
    expect(skillStatus(state, 'listening', 'transport', now)).toBe('unpractised');
  });
  it('requires a different review case, session, and at least 24 hours before confirming retention', () => {
    const check = evidence({
      skill: 'reading',
      source: 'objective',
      correct: true,
      taskId: taskId('transport', 'check', 'reading', 0),
    });
    const state = {
      ...createA2State(),
      evidence: [
        check,
        { ...check, id: 'check2', taskId: taskId('transport', 'check', 'reading', 1) },
      ],
    };
    for (const [hour, session, expected] of [
      ['2026-11-12T11:00:00Z', 'session-2', 'demonstrated'],
      ['2026-11-14T11:00:00Z', 'session-1', 'demonstrated'],
      ['2026-11-14T11:00:00Z', 'session-2', 'confirmed'],
    ] as const) {
      const next = {
        ...state,
        evidence: [
          ...state.evidence,
          ...[0, 1].map((i) => ({
            ...check,
            id: `review${i}`,
            mode: 'review' as const,
            taskId: taskId('transport', 'review', 'reading', i),
            sessionId: session,
            answeredAt: hour,
          })),
        ],
      };
      expect(skillStatus(next, 'reading', 'transport', now)).toBe(expected);
    }
  });
  it('keeps A2 evidence independent of the capped quiz history and migrates old backups safely', () => {
    const app = createDefaultState();
    app.a2 = addA2Evidence(app.a2, evidence());
    app.a2.drafts['a2:transport:practice:writing:0'] = newA2Draft();
    expect(parseImportedState(JSON.stringify(app)).a2).toEqual(app.a2);
    expect(validateAndMigrateState({ version: 1, progress: { totalXp: 100 } })).toMatchObject({
      a2: createA2State(),
      progress: { totalXp: 100 },
    });
    expect(
      sanitizeA2State({
        drafts: { bad: null },
        evidence: [null, evidence({ source: 'objective' })],
        teacherReviews: [null],
      }),
    ).toEqual(createA2State());
  });
});
