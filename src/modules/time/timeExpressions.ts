import type { Difficulty } from '../../types/exercise';

const numberWords: Record<number, string> = {
  0: 'nul',
  1: 'een',
  2: 'twee',
  3: 'drie',
  4: 'vier',
  5: 'vijf',
  6: 'zes',
  7: 'zeven',
  8: 'acht',
  9: 'negen',
  10: 'tien',
  11: 'elf',
  12: 'twaalf',
  13: 'dertien',
  14: 'veertien',
  15: 'vijftien',
  16: 'zestien',
  17: 'zeventien',
  18: 'achttien',
  19: 'negentien',
  20: 'twintig',
  21: 'eenentwintig',
  22: 'tweeëntwintig',
  23: 'drieëntwintig',
  24: 'vierentwintig',
  25: 'vijfentwintig',
  26: 'zesentwintig',
  27: 'zevenentwintig',
  28: 'achtentwintig',
  29: 'negenentwintig',
  30: 'dertig',
  40: 'veertig',
  50: 'vijftig',
};

function numberWord(value: number): string {
  if (numberWords[value]) return numberWords[value];
  const tens = Math.floor(value / 10) * 10;
  const unit = value % 10;
  const joiner = unit === 2 || unit === 3 ? 'ën' : 'en';
  return `${numberWords[unit]}${joiner}${numberWords[tens]}`;
}

function hourWord(hour24: number): string {
  return numberWords[hour24 % 12 || 12];
}

export function getDutchTimeExpressions(hour: number, minute: number): string[] {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError('Hour must be 0–23.');
  if (!Number.isInteger(minute) || minute < 0 || minute > 59)
    throw new RangeError('Minute must be 0–59.');

  const currentHour = hourWord(hour);
  const nextHour = hourWord((hour + 1) % 24);
  let canonical: string;

  if (minute === 0) canonical = `${currentHour} uur`;
  else if (minute === 15) canonical = `kwart over ${currentHour}`;
  else if (minute === 30) canonical = `half ${nextHour}`;
  else if (minute === 45) canonical = `kwart voor ${nextHour}`;
  else if (minute < 15) canonical = `${numberWords[minute]} over ${currentHour}`;
  else if (minute < 30) canonical = `${numberWords[30 - minute]} voor half ${nextHour}`;
  else if (minute < 45) canonical = `${numberWords[minute - 30]} over half ${nextHour}`;
  else canonical = `${numberWords[60 - minute]} voor ${nextHour}`;

  const alternatives: string[] = [];
  if (minute === 0) alternatives.push(currentHour);
  if (minute === 15) alternatives.push(`vijftien over ${currentHour}`);
  if (minute === 45) alternatives.push(`vijftien voor ${nextHour}`);
  if (minute > 0) alternatives.push(`${currentHour} uur ${numberWord(minute)}`);

  return [canonical, ...alternatives];
}

export interface TimeQuestion {
  id: string;
  hour: number;
  minute: number;
  difficulty: Difficulty;
  acceptedAnswers: string[];
  hint: string;
  explanation: string;
}

export function getTimeHint(minute: number): string {
  if (minute === 0) return 'Use the hour followed by “uur”.';
  if (minute === 15) return 'A quarter after the hour is “kwart over …”.';
  if (minute === 30) return 'Dutch names the next hour: 11:30 is “half twaalf”.';
  if (minute === 45) return 'A quarter before the next hour is “kwart voor …”.';
  if (minute < 15) return 'Use the minutes + “over” + the current hour.';
  if (minute < 30) return 'Count the minutes remaining until half past: “… voor half …”.';
  if (minute < 45) return 'Count the minutes after half past: “… over half …”.';
  return 'Count the minutes remaining until the next hour: “… voor …”.';
}

export function generateTimeQuestion(
  difficulty: Difficulty,
  random: () => number = Math.random,
): TimeQuestion {
  const hour = Math.floor(random() * 24);
  let minute: number;

  if (difficulty === 'easy') {
    const minutes = [0, 30];
    minute = minutes[Math.floor(random() * minutes.length)];
  } else if (difficulty === 'medium') {
    minute = Math.floor(random() * 12) * 5;
  } else {
    minute = Math.floor(random() * 60);
  }

  return {
    id: `time-${hour}-${minute}`,
    hour,
    minute,
    difficulty,
    acceptedAnswers: getDutchTimeExpressions(hour, minute),
    hint: getTimeHint(minute),
    explanation: getTimeHint(minute),
  };
}
