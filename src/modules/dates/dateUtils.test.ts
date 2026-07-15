import { describe, expect, it } from 'vitest';
import { formatDutchAppointment, formatDutchDate } from './dateUtils';

describe('Dutch date formatting', () => {
  it('formats dates with lowercase Dutch month names', () => {
    expect(formatDutchDate(1, 1)).toBe('1 januari');
    expect(formatDutchDate(27, 4)).toBe('27 april');
    expect(formatDutchDate(31, 12)).toBe('31 december');
  });

  it('formats a simple appointment', () => {
    expect(formatDutchAppointment('Maandag', 'negen uur')).toBe('maandag om negen uur');
  });

  it('rejects invalid dates and weekdays', () => {
    expect(() => formatDutchDate(0, 1)).toThrow(RangeError);
    expect(() => formatDutchDate(1, 13)).toThrow(RangeError);
    expect(() => formatDutchAppointment('Funday', 'tien uur')).toThrow('Unknown Dutch weekday');
  });
});
