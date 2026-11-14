import { a2Units, tasksForCase } from './a2Data';
import { evidencePassed, skillStatus } from './a2Progress';
import { A2_SKILLS, type A2State, type A2Mode } from './types';
export interface A2Recommendation {
  unitId: string;
  mode: A2Mode;
  taskIndex: number;
  reason: string;
}
export function recommendA2Task(state: A2State, now = new Date()): A2Recommendation | undefined {
  // Retention has priority when a new review task is due and has never been answered.
  for (const unit of a2Units)
    for (const skill of A2_SKILLS) {
      if (skillStatus(state, skill, unit.id, now) !== 'demonstrated') continue;
      const checks = state.evidence.filter(
        (e) =>
          e.unitId === unit.id &&
          e.skill === skill &&
          e.mode === 'check' &&
          !e.supports.length &&
          evidencePassed(state, e),
      );
      if (
        !checks.length ||
        now.getTime() - Math.max(...checks.map((e) => Date.parse(e.answeredAt))) < 86400000
      )
        continue;
      const tasks = tasksForCase(
        unit.id,
        unit.cases.find((c) => c.id === 'review')!,
      );
      const index = tasks.findIndex(
        (task) => task.skill === skill && !state.evidence.some((e) => e.taskId === task.id),
      );
      if (index >= 0)
        return {
          unitId: unit.id,
          mode: 'review',
          taskIndex: index,
          reason: 'Retomar uma habilidade demonstrada em outro dia, com material diferente.',
        };
    }
  // A failed objective answer sends the learner back to supported practice first.
  for (const unit of a2Units) {
    const tasks = tasksForCase(unit.id, unit.cases[0]);
    const recent = state.evidence
      .filter((e) => e.unitId === unit.id)
      .slice()
      .reverse();
    for (const task of tasks) {
      const latest = recent.find(
        (e) => e.skill === task.skill && e.taskId.endsWith(`:${task.index}`),
      );
      if (latest?.source === 'objective' && !latest.correct)
        return {
          unitId: unit.id,
          mode: 'practice',
          taskIndex: tasks.indexOf(task),
          reason: 'Reforçar uma informação que você errou antes de avançar.',
        };
    }
  }
  for (const unit of a2Units) {
    for (const mode of ['practice', 'check'] as const) {
      const tasks = tasksForCase(
        unit.id,
        unit.cases.find((c) => c.id === mode)!,
      );
      const index = tasks.findIndex((task) => !state.evidence.some((e) => e.taskId === task.id));
      if (index >= 0)
        return {
          unitId: unit.id,
          mode,
          taskIndex: index,
          reason:
            mode === 'practice'
              ? 'Continuar a próxima atividade da trilha.'
              : 'Aplicar o que aprendeu em uma situação nova.',
        };
    }
  }
  return undefined;
}
