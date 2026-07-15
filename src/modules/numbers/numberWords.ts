const smallNumbers = [
  'nul',
  'een',
  'twee',
  'drie',
  'vier',
  'vijf',
  'zes',
  'zeven',
  'acht',
  'negen',
  'tien',
  'elf',
  'twaalf',
  'dertien',
  'veertien',
  'vijftien',
  'zestien',
  'zeventien',
  'achttien',
  'negentien',
  'twintig',
];

const tensWords: Record<number, string> = {
  20: 'twintig',
  30: 'dertig',
  40: 'veertig',
  50: 'vijftig',
  60: 'zestig',
  70: 'zeventig',
  80: 'tachtig',
  90: 'negentig',
};

export function numberToDutch(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 9999) {
    throw new RangeError('Number must be an integer from 0 to 9999.');
  }
  if (value <= 20) return smallNumbers[value];
  if (value < 100) {
    const tens = Math.floor(value / 10) * 10;
    const unit = value % 10;
    if (!unit) return tensWords[tens];
    const joiner = unit === 2 || unit === 3 ? 'ën' : 'en';
    return `${smallNumbers[unit]}${joiner}${tensWords[tens]}`;
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    const prefix = hundreds === 1 ? 'honderd' : `${smallNumbers[hundreds]}honderd`;
    return remainder ? `${prefix}${numberToDutch(remainder)}` : prefix;
  }
  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const prefix = thousands === 1 ? 'duizend' : `${numberToDutch(thousands)}duizend`;
  return remainder ? `${prefix}${numberToDutch(remainder)}` : prefix;
}

export function numberToDutchSpaced(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 9999) {
    throw new RangeError('Number must be an integer from 0 to 9999.');
  }
  if (value <= 20) return smallNumbers[value];
  if (value < 100) {
    const tens = Math.floor(value / 10) * 10;
    const unit = value % 10;
    return unit ? `${smallNumbers[unit]} en ${tensWords[tens]}` : tensWords[tens];
  }
  if (value < 1000) {
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    const prefix = hundreds === 1 ? 'honderd' : `${smallNumbers[hundreds]}honderd`;
    return remainder ? `${prefix} ${numberToDutchSpaced(remainder)}` : prefix;
  }
  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const prefix = thousands === 1 ? 'duizend' : `${numberToDutch(thousands)}duizend`;
  return remainder ? `${prefix} ${numberToDutchSpaced(remainder)}` : prefix;
}
