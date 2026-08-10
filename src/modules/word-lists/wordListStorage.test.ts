import { describe, expect, it } from 'vitest';
import { sanitizeCustomWordLists } from './wordListStorage';

describe('custom word-list storage', () => {
  it('keeps valid custom lists and removes incomplete word pairs', () => {
    expect(
      sanitizeCustomWordLists([
        {
          id: 'my-list',
          title: 'My list',
          description: 'Words from class',
          entries: [
            { id: 'one', dutch: 'de tafel', portuguese: 'a mesa' },
            { id: 'two', dutch: '  ', portuguese: 'incomplete' },
          ],
        },
      ]),
    ).toEqual([
      {
        id: 'my-list',
        title: 'My list',
        description: 'Words from class',
        kind: 'custom',
        entries: [{ id: 'one', dutch: 'de tafel', portuguese: 'a mesa' }],
      },
    ]);
  });

  it('rejects a list without a title or complete word pair', () => {
    expect(sanitizeCustomWordLists([{ title: '', entries: [] }])).toEqual([]);
  });
});
