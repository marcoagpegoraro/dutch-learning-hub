import { describe, expect, it } from 'vitest';
import { evaluateAcceptedAnswer, isAcceptedAnswer, normalizeAnswer } from './answerNormalization';

describe('normalizeAnswer', () => {
  it('trims, lowercases, and collapses whitespace', () => {
    expect(normalizeAnswer('  Kwart   OVER  Elf  ')).toBe('kwart over elf');
  });

  it('removes optional final punctuation but keeps internal punctuation', () => {
    expect(normalizeAnswer("'s avonds!")).toBe("'s avonds");
    expect(normalizeAnswer('e-mail')).toBe('e-mail');
  });

  it('normalizes curly and straight apostrophes', () => {
    expect(normalizeAnswer('’s Ochtends')).toBe("'s ochtends");
  });

  it('only normalizes hyphens when requested', () => {
    expect(normalizeAnswer('een-en-twintig')).toBe('een-en-twintig');
    expect(normalizeAnswer('een-en-twintig', { normalizeHyphens: true })).toBe('een en twintig');
  });
});

describe('isAcceptedAnswer', () => {
  it('accepts configured variants after normalization', () => {
    expect(isAcceptedAnswer('  VIJFTIEN over elf.', ['kwart over elf', 'vijftien over elf'])).toBe(
      true,
    );
  });

  it('does not accept an unconfigured semantically different answer', () => {
    expect(isAcceptedAnswer('twintig over elf', ['tien voor half twaalf'])).toBe(false);
  });

  it('accepts a missing accent while flagging the spelling detail', () => {
    expect(
      evaluateAcceptedAnswer('drieduizenddriehonderddrieenzeventig', [
        'drieduizenddriehonderddrieënzeventig',
      ]),
    ).toEqual({
      correct: true,
      needsAccent: true,
      matchingAnswer: 'drieduizenddriehonderddrieënzeventig',
    });
  });
});
