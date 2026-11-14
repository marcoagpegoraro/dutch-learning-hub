import { sanitizeA2State } from './a2Progress';
import { getA2Recording, saveA2Recording, type A2Recording } from './a2Recordings';
import type { A2State } from './types';
export interface A2Portfolio {
  kind: 'dutch-hub-a2-portfolio';
  version: 1;
  displayName: string;
  exportedAt: string;
  a2: A2State;
  recordings: { id: string; taskId: string; createdAt: string; mimeType: string; data: string }[];
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
async function encode(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let result = '';
  for (let offset = 0; offset < bytes.length; offset += 8192)
    result += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(result);
}
export async function exportA2Portfolio(a2: A2State, displayName: string): Promise<A2Portfolio> {
  const ids = [
    ...new Set(
      [
        ...a2.evidence.flatMap((e) => e.recordings),
        ...Object.values(a2.drafts).flatMap((d) => d.recordings),
      ].filter(Boolean),
    ),
  ];
  const recordings: A2Portfolio['recordings'] = [];
  for (const id of ids) {
    const item = await getA2Recording(id);
    if (!item)
      throw new Error(
        'Há gravações ausentes neste dispositivo. Importe os áudios ou exporte o progresso sem áudio em Settings.',
      );
    recordings.push({
      id: item.id,
      taskId: item.taskId,
      createdAt: item.createdAt,
      mimeType: item.blob.type,
      data: await encode(item.blob),
    });
  }
  return {
    kind: 'dutch-hub-a2-portfolio',
    version: 1,
    displayName,
    exportedAt: new Date().toISOString(),
    a2,
    recordings,
  };
}
export function parseA2Portfolio(value: unknown): A2Portfolio {
  if (
    !record(value) ||
    value.kind !== 'dutch-hub-a2-portfolio' ||
    value.version !== 1 ||
    !record(value.a2) ||
    !Array.isArray(value.recordings)
  )
    throw new Error('Este arquivo não é um portfólio A2 válido.');
  const recordings: A2Portfolio['recordings'] = [];
  const seen = new Set<string>();
  for (const clip of value.recordings) {
    if (
      !record(clip) ||
      typeof clip.id !== 'string' ||
      seen.has(clip.id) ||
      typeof clip.taskId !== 'string' ||
      !clip.taskId.startsWith('a2:') ||
      typeof clip.mimeType !== 'string' ||
      !/^audio\/[a-z0-9.+-]+(?:;.*)?$/i.test(clip.mimeType) ||
      typeof clip.data !== 'string' ||
      clip.data.length > 28 * 1024 * 1024 ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(clip.data) ||
      clip.data.length % 4 !== 0
    )
      throw new Error('O portfólio contém um áudio inválido ou duplicado.');
    seen.add(clip.id);
    recordings.push({
      id: clip.id,
      taskId: clip.taskId,
      mimeType: clip.mimeType,
      data: clip.data,
      createdAt: typeof clip.createdAt === 'string' ? clip.createdAt : '',
    });
  }
  const a2 = sanitizeA2State(value.a2);
  return {
    kind: 'dutch-hub-a2-portfolio',
    version: 1,
    displayName: typeof value.displayName === 'string' ? value.displayName.slice(0, 80) : 'Aluno',
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : '',
    a2,
    recordings,
  };
}
export function decodeRecording(clip: A2Portfolio['recordings'][number]): A2Recording {
  const bytes = Uint8Array.from(atob(clip.data), (char) => char.charCodeAt(0));
  return {
    id: clip.id,
    taskId: clip.taskId,
    createdAt: clip.createdAt,
    blob: new Blob([bytes], { type: clip.mimeType }),
  };
}
export async function importPortfolioRecordings(portfolio: A2Portfolio) {
  for (const clip of portfolio.recordings) await saveA2Recording(decodeRecording(clip));
}
export function mergeA2State(current: A2State, incoming: A2State): A2State {
  const evidence = [
    ...new Map([...incoming.evidence, ...current.evidence].map((e) => [e.id, e])).values(),
  ];
  const teacherReviews = [
    ...new Map(
      [...incoming.teacherReviews, ...current.teacherReviews].map((r) => [r.evidenceId, r]),
    ).values(),
  ];
  const drafts = { ...current.drafts };
  for (const [id, draft] of Object.entries(incoming.drafts))
    if (!drafts[id] || Date.parse(draft.updatedAt) > Date.parse(drafts[id].updatedAt))
      drafts[id] = draft;
  return { drafts, evidence, teacherReviews };
}
