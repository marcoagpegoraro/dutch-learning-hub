export const A2_SKILLS = [
  'reading',
  'listening',
  'writing',
  'speaking',
  'interaction',
  'mediation',
] as const;
export type A2Skill = (typeof A2_SKILLS)[number];
export type A2Mode = 'practice' | 'check' | 'review';
export const SKILL_LABELS: Record<A2Skill, string> = {
  reading: 'Leitura',
  listening: 'Compreensão oral',
  writing: 'Escrita',
  speaking: 'Produção oral',
  interaction: 'Interação',
  mediation: 'Mediação',
};
export const MODE_LABELS: Record<A2Mode, string> = {
  practice: 'Aprender',
  check: 'Situação nova',
  review: 'Revisão posterior',
};
export const RUBRIC_LABELS = [
  'Cumprimento da tarefa',
  'Compreensibilidade',
  'Recursos linguísticos',
  'Organização e interação',
] as const;
export interface A2Question {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}
export interface A2Document {
  title: string;
  text: string;
  questions: A2Question[];
}
export interface A2Audio extends A2Document {
  segments: { voice: 'Xander' | 'Ellen'; text: string }[];
  file: string;
}
export interface A2OpenTask {
  instruction: string;
  points: string[];
  samples: string[];
}
export interface A2Turn {
  prompt: string;
  instruction: string;
  sample: string;
  file: string;
}
export interface A2Case {
  id: A2Mode;
  title: string;
  documents: A2Document[];
  audios: A2Audio[];
  writing: A2OpenTask;
  speaking: A2OpenTask;
  mediation: A2OpenTask & { source: string };
  dialogue: A2Turn[];
}
export interface A2Unit {
  id: string;
  title: string;
  icon: string;
  objective: string;
  supportRoutes: { label: string; route: string }[];
  cases: A2Case[];
  reviewStatus: 'draft';
}
export interface A2Draft {
  response: string;
  answers: number[];
  plays: number;
  turns: string[];
  recordings: string[];
  supports: string[];
  rubric: number[];
  updatedAt: string;
}
export interface A2Evidence {
  id: string;
  taskId: string;
  unitId: string;
  mode: A2Mode;
  skill: A2Skill;
  sessionId: string;
  response: string;
  recordings: string[];
  supports: string[];
  answeredAt: string;
  source: 'objective' | 'self';
  correct?: boolean;
  rubric?: number[];
}
export interface A2TeacherReview {
  evidenceId: string;
  reviewer: string;
  scores: number[];
  comment: string;
  reviewedAt: string;
}
export interface A2State {
  drafts: Record<string, A2Draft>;
  evidence: A2Evidence[];
  teacherReviews: A2TeacherReview[];
}
export const createA2State = (): A2State => ({ drafts: {}, evidence: [], teacherReviews: [] });
export const makeA2Id = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
