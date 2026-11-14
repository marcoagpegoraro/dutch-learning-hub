import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import {
  exportA2Portfolio,
  importPortfolioRecordings,
  mergeA2State,
  parseA2Portfolio,
} from './a2Portfolio';
import {
  clearA2Recordings,
  deleteA2Recording,
  getA2Recording,
  listA2Recordings,
  saveA2Recording,
} from './a2Recordings';
import { createA2State, type A2Evidence } from './types';
const item: A2Evidence = {
  id: 'response-1',
  taskId: 'a2:transport:check:speaking:0',
  unitId: 'transport',
  mode: 'check',
  skill: 'speaking',
  sessionId: 'test',
  response: 'Ik wil naar Leiden.',
  recordings: ['clip-1'],
  supports: [],
  answeredAt: '2026-11-12T10:00:00Z',
  source: 'self',
  rubric: [2, 2, 2, 2],
};
beforeEach(async () => {
  vi.stubGlobal('indexedDB', indexedDB);
  await clearA2Recordings();
});
afterEach(() => vi.unstubAllGlobals());
describe('local recordings and complete portfolio backup', () => {
  it('stores, reads, exports, restores and deletes the original audio bytes', async () => {
    const blob = new Blob(['original audio bytes'], { type: 'audio/webm' });
    await saveA2Recording({ id: 'clip-1', taskId: item.taskId, createdAt: item.answeredAt, blob });
    const state = { ...createA2State(), evidence: [item] };
    const portfolio = await exportA2Portfolio(state, 'Aluno');
    expect(portfolio.recordings).toHaveLength(1);
    await clearA2Recordings();
    expect(await listA2Recordings()).toEqual([]);
    const parsed = parseA2Portfolio(JSON.parse(JSON.stringify(portfolio)));
    await importPortfolioRecordings(parsed);
    expect(await (await getA2Recording('clip-1'))?.blob.text()).toBe('original audio bytes');
    expect(parsed.a2.evidence).toEqual([item]);
    await deleteA2Recording('clip-1');
    expect(await getA2Recording('clip-1')).toBeUndefined();
  });
  it('reports missing clips instead of silently exporting an incomplete recording backup', async () => {
    await expect(
      exportA2Portfolio({ ...createA2State(), evidence: [item] }, 'Aluno'),
    ).rejects.toThrow('ausentes');
  });
  it('rejects malformed media, duplicate ids and unrelated backup types', () => {
    const base = {
      kind: 'dutch-hub-a2-portfolio',
      version: 1,
      a2: createA2State(),
      recordings: [],
    };
    expect(() => parseA2Portfolio({ ...base, kind: 'other' })).toThrow();
    const clip = { id: 'clip', taskId: item.taskId, mimeType: 'text/html', data: 'YWJj' };
    expect(() => parseA2Portfolio({ ...base, recordings: [clip] })).toThrow('áudio inválido');
    expect(() =>
      parseA2Portfolio({
        ...base,
        recordings: [{ ...clip, mimeType: 'audio/webm', data: '%invalid%' }],
      }),
    ).toThrow();
    const good = { ...clip, mimeType: 'audio/webm' };
    expect(() => parseA2Portfolio({ ...base, recordings: [good, good] })).toThrow('duplicado');
  });
  it('merges evidence and preserves more recent local drafts without erasing existing work', () => {
    const local = { ...createA2State(), evidence: [item] };
    const incoming = { ...createA2State(), evidence: [{ ...item, id: 'other' }] };
    expect(
      mergeA2State(local, incoming)
        .evidence.map((e) => e.id)
        .sort(),
    ).toEqual(['other', 'response-1']);
    expect(mergeA2State(local, local).evidence).toHaveLength(1);
  });
});
