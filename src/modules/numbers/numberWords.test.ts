import { describe, expect, it } from 'vitest';
import { numberToDutch, numberToDutchSpaced } from './numberWords';

describe('numberToDutch', () => {
  it.each([
    [0, 'nul'],
    [11, 'elf'],
    [20, 'twintig'],
    [22, 'tweeëntwintig'],
    [38, 'achtendertig'],
    [80, 'tachtig'],
    [100, 'honderd'],
    [342, 'driehonderdtweeënveertig'],
    [1000, 'duizend'],
    [2026, 'tweeduizendzesentwintig'],
    [9999, 'negenduizendnegenhonderdnegenennegentig'],
    [1_000_000, 'een miljoen'],
    [10_000_000, 'tien miljoen'],
  ])('converts %i to Dutch', (value, expected) => {
    expect(numberToDutch(value)).toBe(expected);
  });

  it('provides learner-friendly spaced variants', () => {
    expect(numberToDutchSpaced(42)).toBe('twee en veertig');
    expect(numberToDutchSpaced(342)).toBe('driehonderd twee en veertig');
  });

  it('rejects unsupported values', () => {
    expect(() => numberToDutch(-1)).toThrow(RangeError);
    expect(() => numberToDutch(10_000_001)).toThrow(RangeError);
    expect(() => numberToDutch(2.5)).toThrow(RangeError);
  });
});
