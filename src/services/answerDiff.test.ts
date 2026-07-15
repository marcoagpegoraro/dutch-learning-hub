import { describe, expect, it } from 'vitest';
import { diffAnswers } from './answerDiff';

describe('answer differences', () => {
  it('marks matching words', () => {
    expect(diffAnswers('ik woon in utrecht', 'Ik woon in Utrecht.')).toEqual([
      { kind: 'same', value: 'ik' },
      { kind: 'same', value: 'woon' },
      { kind: 'same', value: 'in' },
      { kind: 'same', value: 'utrecht' },
    ]);
  });

  it('marks missing and extra words around the shared sequence', () => {
    const diff = diffAnswers('morgen ga ik naar school', 'morgen ik naar huis');
    expect(diff).toContainEqual({ kind: 'missing', value: 'ga' });
    expect(diff).toContainEqual({ kind: 'missing', value: 'school' });
    expect(diff).toContainEqual({ kind: 'extra', value: 'huis' });
    expect(diff.filter((part) => part.kind === 'same').map((part) => part.value)).toEqual([
      'morgen',
      'ik',
      'naar',
    ]);
  });
});
