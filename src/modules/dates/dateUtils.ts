export const dutchWeekdays = [
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
  'zondag',
] as const;

export const dutchMonths = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
] as const;

export function formatDutchDate(day: number, month: number): string {
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError('Day must be 1–31.');
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new RangeError('Month must be 1–12.');
  return `${day} ${dutchMonths[month - 1]}`;
}

export function formatDutchAppointment(day: string, time: string): string {
  const weekday = day.toLocaleLowerCase('nl-NL');
  if (!dutchWeekdays.includes(weekday as (typeof dutchWeekdays)[number])) {
    throw new Error('Unknown Dutch weekday.');
  }
  return `${weekday} om ${time}`;
}
