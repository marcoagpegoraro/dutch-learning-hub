import { describe, expect, it } from 'vitest';
import { findNumberWordDifference } from './numberFeedback';

describe('number-word feedback', () => {
  it('pinpoints a connector typed as a number word', () => {
    expect(
      findNumberWordDifference(
        'negenduizendnegenhonderdachtenzeventig',
        'negenduizendnegenhonderdachteenzeventig',
      ),
    ).toEqual({ kind: 'replace', expected: 'en', actual: 'een' });
  });

  it('pinpoints a mistyped number part', () => {
    expect(findNumberWordDifference('vierentwintig', 'veerentwintig')).toEqual({
      kind: 'replace',
      expected: 'vier',
      actual: 'veer',
    });
  });

  it('identifies a different number word in the same position', () => {
    expect(findNumberWordDifference('tweeënveertig', 'drieënveertig')).toEqual({
      kind: 'replace',
      expected: 'twee',
      actual: 'drie',
    });
  });
});
