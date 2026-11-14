import {
  A2_SKILLS,
  createA2State,
  type A2State,
  type A2Draft,
  type A2Evidence,
  type A2TeacherReview,
  type A2Skill,
} from './types';
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((s): s is string => typeof s === 'string').map((s) => s.slice(0, 10000))
    : [];
const validDate = (v: unknown): v is string =>
  typeof v === 'string' && Number.isFinite(Date.parse(v));
export const validRubric = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length === 4 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 3);
export const newA2Draft = (): A2Draft => ({
  response: '',
  answers: [],
  plays: 0,
  turns: [],
  recordings: [],
  supports: [],
  rubric: [-1, -1, -1, -1],
  updatedAt: new Date().toISOString(),
});
export const taskId = (unit: string, mode: string, skill: string, index = 0) =>
  `a2:${unit}:${mode}:${skill}:${index}`;

export function sanitizeA2State(value: unknown): A2State {
  if (!record(value)) return createA2State();
  const drafts: A2State['drafts'] = {};
  if (record(value.drafts))
    for (const [id, draft] of Object.entries(value.drafts)) {
      if (!id.startsWith('a2:') || !record(draft)) continue;
      drafts[id] = {
        plays:
          typeof draft.plays === 'number' && Number.isFinite(draft.plays)
            ? Math.max(0, Math.floor(draft.plays))
            : 0,
        response: typeof draft.response === 'string' ? draft.response.slice(0, 10000) : '',
        answers: Array.isArray(draft.answers)
          ? draft.answers.map((n) => (Number.isInteger(n) && n >= -1 && n < 20 ? n : -1))
          : [],
        turns: strings(draft.turns),
        recordings: strings(draft.recordings),
        supports: strings(draft.supports),
        rubric:
          Array.isArray(draft.rubric) &&
          draft.rubric.length === 4 &&
          draft.rubric.every((n) => Number.isInteger(n) && n >= -1 && n <= 3)
            ? draft.rubric
            : [-1, -1, -1, -1],
        updatedAt: validDate(draft.updatedAt) ? draft.updatedAt : new Date().toISOString(),
      };
    }
  const evidence: A2Evidence[] = [];
  const seen = new Set<string>();
  if (Array.isArray(value.evidence))
    for (const item of value.evidence) {
      if (
        !record(item) ||
        typeof item.id !== 'string' ||
        seen.has(item.id) ||
        typeof item.taskId !== 'string' ||
        !item.taskId.startsWith('a2:') ||
        typeof item.unitId !== 'string' ||
        !['practice', 'check', 'review'].includes(item.mode as string) ||
        !A2_SKILLS.includes(item.skill as A2Skill) ||
        !['objective', 'self'].includes(item.source as string) ||
        !validDate(item.answeredAt) ||
        typeof item.sessionId !== 'string'
      )
        continue;
      if (
        (item.skill === 'reading' || item.skill === 'listening') !==
        (item.source === 'objective')
      )
        continue;
      seen.add(item.id);
      evidence.push({
        id: item.id,
        taskId: item.taskId,
        unitId: item.unitId,
        mode: item.mode as A2Evidence['mode'],
        skill: item.skill as A2Skill,
        sessionId: item.sessionId,
        response: typeof item.response === 'string' ? item.response.slice(0, 10000) : '',
        recordings: strings(item.recordings),
        supports: strings(item.supports),
        answeredAt: item.answeredAt,
        source: item.source as A2Evidence['source'],
        ...(item.source === 'objective' ? { correct: item.correct === true } : {}),
        ...(validRubric(item.rubric) ? { rubric: item.rubric } : {}),
      });
    }
  const teacherReviews: A2TeacherReview[] = [];
  if (Array.isArray(value.teacherReviews))
    for (const review of value.teacherReviews) {
      if (
        !record(review) ||
        typeof review.evidenceId !== 'string' ||
        !seen.has(review.evidenceId) ||
        typeof review.reviewer !== 'string' ||
        !review.reviewer.trim() ||
        !validRubric(review.scores) ||
        !validDate(review.reviewedAt)
      )
        continue;
      teacherReviews.push({
        evidenceId: review.evidenceId,
        reviewer: review.reviewer.slice(0, 100),
        scores: review.scores,
        comment: typeof review.comment === 'string' ? review.comment.slice(0, 3000) : '',
        reviewedAt: review.reviewedAt,
      });
    }
  return { drafts, evidence, teacherReviews };
}

export function addA2Evidence(state: A2State, evidence: A2Evidence): A2State {
  if (state.evidence.some((e) => e.id === evidence.id)) return state;
  return { ...state, evidence: [...state.evidence, evidence] };
}
export function evidencePassed(state: A2State, e: A2Evidence): boolean {
  if (e.source === 'objective') return e.correct === true;
  const review = state.teacherReviews.find((r) => r.evidenceId === e.id);
  return !!review && review.scores.every((s) => s >= 2);
}
export type A2SkillStatus = 'unpractised' | 'practised' | 'demonstrated' | 'confirmed';
export const STATUS_LABELS: Record<A2SkillStatus, string> = {
  unpractised: 'Ainda não praticado',
  practised: 'Praticado · ainda sem demonstração',
  demonstrated: 'Demonstrado em situação nova',
  confirmed: 'Confirmado em revisão posterior',
};

export function skillStatus(
  state: A2State,
  skill: A2Skill,
  unitId: string,
  now = new Date(),
): A2SkillStatus {
  const all = state.evidence.filter(
    (e) => e.skill === skill && e.unitId === unitId && Date.parse(e.answeredAt) <= now.getTime(),
  );
  if (!all.length) return 'unpractised';
  const passed = all.filter((e) => !e.supports.length && evidencePassed(state, e));
  const checks = passed.filter((e) => e.mode === 'check');
  const checkTasks = new Set(checks.map((e) => e.taskId));
  // Reading and listening each have two distinct sources per case.
  if (checkTasks.size < (skill === 'reading' || skill === 'listening' ? 2 : 1)) return 'practised';
  const demonstratedAt = Math.max(...checks.map((e) => Date.parse(e.answeredAt)));
  const reviews = passed.filter(
    (e) =>
      e.mode === 'review' &&
      Date.parse(e.answeredAt) - demonstratedAt >= 24 * 60 * 60 * 1000 &&
      checks.every((c) => c.sessionId !== e.sessionId),
  );
  if (
    new Set(reviews.map((e) => e.taskId)).size >=
    (skill === 'reading' || skill === 'listening' ? 2 : 1)
  )
    return 'confirmed';
  return 'demonstrated';
}

export function importTeacherReviews(state: A2State, value: unknown): A2State {
  if (
    !record(value) ||
    value.kind !== 'dutch-hub-a2-reviews' ||
    value.version !== 1 ||
    !Array.isArray(value.reviews)
  )
    throw new Error('Arquivo de avaliação inválido.');
  const result = sanitizeA2State({ ...state, teacherReviews: value.reviews });
  if (!result.teacherReviews.length || result.teacherReviews.length !== value.reviews.length)
    throw new Error(
      'A avaliação contém tentativas desconhecidas ou notas inválidas. Importe primeiro o progresso correspondente.',
    );
  const ids = new Set(result.teacherReviews.map((r) => r.evidenceId));
  if (ids.size !== result.teacherReviews.length)
    throw new Error('O arquivo repete a mesma tentativa em mais de uma avaliação.');
  return {
    ...state,
    teacherReviews: [
      ...state.teacherReviews.filter((r) => !ids.has(r.evidenceId)),
      ...result.teacherReviews,
    ],
  };
}
