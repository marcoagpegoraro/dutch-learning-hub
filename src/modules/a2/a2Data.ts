import { A2_AUDIO_VERSION } from './audioVersion';
import { taskId } from './a2Progress';
import content from './a2Content.json';
import type { A2Unit, A2Case, A2Skill } from './types';
export const a2Units = content as A2Unit[];
export const findA2Unit = (id?: string) => a2Units.find((u) => u.id === id);
export const skillObjectives: Record<A2Skill, { objective: string; reference: string }> = {
  reading: {
    objective: 'Localizar informações em documentos e mensagens cotidianos.',
    reference: 'QECR: compreensão de leitura, pp. 54–58',
  },
  listening: {
    objective: 'Identificar o ponto principal e detalhes de mensagens claras.',
    reference: 'QECR: compreensão oral, pp. 48–52',
  },
  writing: {
    objective: 'Escrever uma mensagem que comunique as informações necessárias.',
    reference: 'QECR: produção e interação escrita, pp. 66–68 e 82–83',
  },
  speaking: {
    objective: 'Formular uma mensagem oral compreensível sobre uma situação familiar.',
    reference: 'QECR: produção oral, pp. 62–65',
  },
  interaction: {
    objective: 'Responder, esclarecer e confirmar informações numa troca curta.',
    reference: 'QECR: interação e estratégias, pp. 72–89',
  },
  mediation: {
    objective: 'Transmitir a informação relevante de um recado a outra pessoa.',
    reference: 'QECR: mediação, pp. 91–105',
  },
};
export function caseAudioFiles(material: A2Case): string[] {
  return [...material.audios.map((a) => a.file), ...material.dialogue.map((t) => t.file)];
}
export const a2AssetUrl = (file: string) =>
  `${import.meta.env.BASE_URL}${file}?v=${A2_AUDIO_VERSION}`;

export interface A2Task {
  id: string;
  skill: A2Skill;
  index: number;
  title: string;
}
export function tasksForCase(unitId: string, material: A2Case): A2Task[] {
  return [
    ...material.documents.map((d, index) => ({ skill: 'reading' as const, index, title: d.title })),
    ...material.audios.map((a, index) => ({ skill: 'listening' as const, index, title: a.title })),
    { skill: 'writing' as const, index: 0, title: 'Escrever uma mensagem' },
    { skill: 'speaking' as const, index: 0, title: 'Gravar uma resposta' },
    { skill: 'interaction' as const, index: 0, title: 'Conversar e esclarecer' },
    { skill: 'mediation' as const, index: 0, title: 'Repassar uma informação' },
  ].map((item) => ({ ...item, id: taskId(unitId, material.id, item.skill, item.index) }));
}
