import { describe, expect, it } from 'vitest';
import { starterWordLists, type WordList } from './wordListData';
import {
  answerWordList,
  createWordListsState,
  createWordListSession,
  removeWordList,
  retryWordList,
  startWordList,
  wordProgressKey,
  type WordListsState,
} from './wordListEngine';
import {
  parseImportedState,
  createDefaultState,
  validateAndMigrateState,
  loadAppState,
  STORAGE_KEY,
} from '../../services/storage';
import { CUSTOM_WORD_LISTS_STORAGE_KEY } from './wordListStorage';
import { vi } from 'vitest';

const small: WordList = {
  id: 'test',
  title: 'Test',
  description: 'Test words',
  kind: 'custom',
  entries: [
    { id: 'one', dutch: 'de hond', portuguese: 'o cachorro' },
    { id: 'two', dutch: 'de kat', portuguese: 'o gato' },
  ],
};
const start = () =>
  startWordList({ ...createWordListsState(), customLists: [small] }, small, [small]);
const session = (state: WordListsState) => state.themes[small.id].session!;

describe('theme memorisation', () => {
  it('requires a full uninterrupted pass in each direction before saving completion', () => {
    let state = start();
    expect(session(state).phase).toBe('to-dutch');
    state = answerWordList(state, small.id, 'correct');
    expect(state.themes.test.completions).toBe(0);
    state = answerWordList(state, small.id, 'correct');
    expect(session(state)).toMatchObject({ phase: 'to-portuguese', index: 0 });
    state = answerWordList(state, small.id, 'correct');
    state = answerWordList(state, small.id, 'correct', '2026-11-12T09:00:00Z');
    expect(state.themes.test).toMatchObject({
      completions: 1,
      lastCompletedAt: '2026-11-12T09:00:00Z',
      session: { phase: 'complete' },
    });
    expect(answerWordList(state, small.id, 'correct')).toBe(state);
    state = startWordList(state, small, [small]);
    expect(state.themes.test.completions).toBe(1);
    expect(session(state).phase).toBe('to-dutch');
  });

  it.each(['wrong', 'revealed'] as const)(
    'counts %s once and restarts only the current round',
    (outcome) => {
      let state = start();
      for (let i = 0; i < 3; i++) state = answerWordList(state, small.id, 'correct');
      state = answerWordList(state, small.id, outcome);
      const key = wordProgressKey(session(state).queue[1], 'to-portuguese');
      expect(state.words[key].mistakes).toBe(1);
      expect(answerWordList(state, small.id, outcome)).toBe(state);
      expect(answerWordList(state, small.id, 'correct')).toBe(state);
      state = retryWordList(state, small.id);
      expect(session(state)).toMatchObject({ phase: 'to-portuguese', index: 0, feedback: null });
      expect(state.themes.test.completions).toBe(0);
    },
  );

  it('resumes the same queue and position, including after export and import', () => {
    let state = answerWordList(start(), small.id, 'correct');
    state = answerWordList(state, small.id, 'revealed');
    const app = { ...createDefaultState(), wordLists: state };
    const restored = parseImportedState(JSON.stringify(app));
    expect(restored.wordLists).toEqual(state);
    expect(startWordList(restored.wordLists, small, [small])).toEqual(state);
  });

  it('interleaves only seen words, ranks most mistakes first, and keeps theme order', () => {
    const source = starterWordLists[0];
    const target = starterWordLists[1];
    const state = createWordListsState();
    for (let i = 0; i < 5; i++) {
      const word = { listId: source.id, entryId: source.entries[i].id, review: false };
      state.words[wordProgressKey(word, 'to-dutch')] = {
        correct: 1,
        mistakes: i,
        lastPracticedAt: '2026-11-10',
      };
    }
    const queue = createWordListSession(target, [source, target], state).queue;
    expect(queue.filter((word) => !word.review).map((word) => word.entryId)).toEqual(
      target.entries.map((entry) => entry.id),
    );
    expect(queue.filter((word) => word.review).map((word) => word.entryId)).toEqual([
      source.entries[4].id,
      source.entries[3].id,
      source.entries[2].id,
    ]);
    expect(queue[5].review).toBe(true);
    expect(
      createWordListSession(target, [source, target], createWordListsState()).queue,
    ).toHaveLength(20);
  });

  it('retries inserted reviews in place without losing the current theme position', () => {
    const source = starterWordLists[0];
    const target = starterWordLists[1];
    let state = createWordListsState();
    state.words[
      wordProgressKey(
        { listId: source.id, entryId: source.entries[0].id, review: false },
        'to-dutch',
      )
    ] = { correct: 0, mistakes: 2, lastPracticedAt: '' };
    state = startWordList(state, target, [source, target]);
    for (let i = 0; i < 5; i++) state = answerWordList(state, target.id, 'correct');
    state = retryWordList(answerWordList(state, target.id, 'revealed'), target.id);
    expect(state.themes[target.id].session).toMatchObject({ index: 5, feedback: null });
    state = answerWordList(state, target.id, 'correct');
    expect(state.themes[target.id].session?.index).toBe(6);
  });

  it('removes deleted custom review words without breaking other saved sessions', () => {
    let state = start();
    state = answerWordList(state, small.id, 'wrong');
    const target = starterWordLists[1];
    state = startWordList(state, target, [small, target]);
    for (let i = 0; i < 5; i++) state = answerWordList(state, target.id, 'correct');
    state = answerWordList(state, target.id, 'revealed');
    state = removeWordList(state, small.id);
    expect(state.themes.test).toBeUndefined();
    expect(state.customLists).toEqual([]);
    expect(state.themes[target.id].session?.queue.every((word) => word.listId !== small.id)).toBe(
      true,
    );
    expect(state.themes[target.id].session?.feedback).toBe(null);
    expect(state.themes[target.id].session?.index).toBe(5);
    expect(Object.keys(state.words)).toHaveLength(5);
  });
});

describe('theme storage compatibility', () => {
  it('accepts old backups and sanitises invalid statistics and missing word references', () => {
    expect(validateAndMigrateState({ version: 1 }).wordLists).toEqual(createWordListsState());
    const state = start();
    state.themes.test.completions = -3;
    session(state).queue[0].entryId = 'missing';
    const restored = validateAndMigrateState({ version: 1, wordLists: state });
    expect(restored.wordLists.themes.test).toEqual({ completions: 0 });
    expect(restored.wordLists.customLists).toHaveLength(1);
  });

  it('rejects imported sessions that reorder or duplicate theme words', () => {
    const state = start();
    session(state).queue.reverse();
    expect(
      validateAndMigrateState({ version: 1, wordLists: state }).wordLists.themes.test.session,
    ).toBeUndefined();
    session(state).queue.reverse();
    session(state).queue.push(session(state).queue[0]);
    expect(
      validateAndMigrateState({ version: 1, wordLists: state }).wordLists.themes.test.session,
    ).toBeUndefined();
  });

  it('migrates legacy custom lists once and honours subsequent resets', () => {
    const legacy = JSON.stringify([small]);
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => (key === CUSTOM_WORD_LISTS_STORAGE_KEY ? legacy : null),
      },
    });
    try {
      expect(loadAppState().wordLists.customLists).toEqual([small]);
      window.localStorage.getItem = (key: string) =>
        key === STORAGE_KEY ? JSON.stringify(createDefaultState()) : legacy;
      expect(loadAppState().wordLists.customLists).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
