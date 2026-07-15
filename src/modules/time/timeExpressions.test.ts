import { describe, expect, it } from 'vitest';
import { generateTimeQuestion, getDutchTimeExpressions } from './timeExpressions';

describe('getDutchTimeExpressions', () => {
  it.each([
    [11, 0, 'elf uur'],
    [11, 10, 'tien over elf'],
    [11, 15, 'kwart over elf'],
    [11, 20, 'tien voor half twaalf'],
    [11, 30, 'half twaalf'],
    [11, 40, 'tien over half twaalf'],
    [11, 45, 'kwart voor twaalf'],
    [11, 50, 'tien voor twaalf'],
  ])('generates the canonical expression for %i:%i', (hour, minute, expected) => {
    expect(getDutchTimeExpressions(hour, minute)[0]).toBe(expected);
  });

  it('wraps the next hour across midnight and noon', () => {
    expect(getDutchTimeExpressions(23, 30)[0]).toBe('half twaalf');
    expect(getDutchTimeExpressions(12, 30)[0]).toBe('half een');
  });

  it('includes legitimate quarter-hour alternatives', () => {
    expect(getDutchTimeExpressions(11, 15)).toContain('vijftien over elf');
    expect(getDutchTimeExpressions(11, 45)).toContain('vijftien voor twaalf');
  });

  it('accepts a precise digital-style expression as an alternative', () => {
    expect(getDutchTimeExpressions(11, 42)).toContain('elf uur tweeënveertig');
  });

  it('rejects invalid clock values', () => {
    expect(() => getDutchTimeExpressions(24, 0)).toThrow(RangeError);
    expect(() => getDutchTimeExpressions(12, 60)).toThrow(RangeError);
  });
});

describe('generateTimeQuestion', () => {
  const sequence = (...values: number[]) => {
    let index = 0;
    return () => values[index++] ?? 0;
  };

  it('limits easy questions to full and half hours', () => {
    expect(generateTimeQuestion('easy', sequence(0.5, 0)).minute).toBe(0);
    expect(generateTimeQuestion('easy', sequence(0.5, 0.99)).minute).toBe(30);
  });

  it('limits medium questions to five-minute intervals', () => {
    const question = generateTimeQuestion('medium', sequence(0.25, 0.51));
    expect(question.minute).toBe(30);
    expect(question.minute % 5).toBe(0);
  });

  it('allows every minute at hard difficulty', () => {
    expect(generateTimeQuestion('hard', sequence(0, 0.99)).minute).toBe(59);
  });
});
