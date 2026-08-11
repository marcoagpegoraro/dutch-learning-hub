import { normalizeAnswer } from '../../services/answerNormalization';

type DifferenceKind = 'replace' | 'missing' | 'extra';

export interface NumberWordDifference {
  kind: DifferenceKind;
  expected?: string;
  actual?: string;
}

interface WordPart {
  value: string;
  known: boolean;
}

const numberParts = [
  'negentien',
  'achttien',
  'zeventien',
  'zestien',
  'vijftien',
  'veertien',
  'dertien',
  'twaalf',
  'veertig',
  'vijftig',
  'zestig',
  'zeventig',
  'tachtig',
  'negentig',
  'twintig',
  'dertig',
  'honderd',
  'duizend',
  'miljoen',
  'tien',
  'elf',
  'een',
  'twee',
  'drie',
  'vier',
  'vijf',
  'zes',
  'zeven',
  'acht',
  'negen',
  'nul',
  'ën',
  'en',
].sort((left, right) => right.length - left.length);

function compactNumberWord(value: string): string {
  return normalizeAnswer(value, { normalizeHyphens: true }).replaceAll(' ', '');
}

function tokenizeNumberWord(value: string): WordPart[] {
  const compact = compactNumberWord(value);
  const parts: WordPart[] = [];
  let index = 0;

  while (index < compact.length) {
    const match = numberParts.find((part) => compact.startsWith(part, index));
    if (match) {
      parts.push({ value: match, known: true });
      index += match.length;
      continue;
    }

    let nextKnownPart = compact.length;
    for (let candidate = index + 1; candidate < compact.length; candidate += 1) {
      if (numberParts.some((part) => compact.startsWith(part, candidate))) {
        nextKnownPart = candidate;
        break;
      }
    }
    parts.push({ value: compact.slice(index, nextKnownPart), known: false });
    index = nextKnownPart;
  }

  return parts;
}

export function findNumberWordDifference(
  expected: string,
  actual: string,
): NumberWordDifference | null {
  const expectedParts = tokenizeNumberWord(expected);
  const actualParts = tokenizeNumberWord(actual);
  const distances = Array.from({ length: expectedParts.length + 1 }, () =>
    Array<number>(actualParts.length + 1).fill(0),
  );

  for (let expectedIndex = expectedParts.length; expectedIndex >= 0; expectedIndex -= 1) {
    for (let actualIndex = actualParts.length; actualIndex >= 0; actualIndex -= 1) {
      if (expectedIndex === expectedParts.length) {
        distances[expectedIndex][actualIndex] = actualParts.length - actualIndex;
      } else if (actualIndex === actualParts.length) {
        distances[expectedIndex][actualIndex] = expectedParts.length - expectedIndex;
      } else if (expectedParts[expectedIndex].value === actualParts[actualIndex].value) {
        distances[expectedIndex][actualIndex] = distances[expectedIndex + 1][actualIndex + 1];
      } else {
        distances[expectedIndex][actualIndex] =
          1 +
          Math.min(
            distances[expectedIndex + 1][actualIndex + 1],
            distances[expectedIndex + 1][actualIndex],
            distances[expectedIndex][actualIndex + 1],
          );
      }
    }
  }

  let expectedIndex = 0;
  let actualIndex = 0;
  while (expectedIndex < expectedParts.length || actualIndex < actualParts.length) {
    if (
      expectedIndex < expectedParts.length &&
      actualIndex < actualParts.length &&
      expectedParts[expectedIndex].value === actualParts[actualIndex].value
    ) {
      expectedIndex += 1;
      actualIndex += 1;
      continue;
    }
    if (
      expectedIndex < expectedParts.length &&
      actualIndex < actualParts.length &&
      distances[expectedIndex][actualIndex] === distances[expectedIndex + 1][actualIndex + 1] + 1
    ) {
      return {
        kind: 'replace',
        expected: expectedParts[expectedIndex].value,
        actual: actualParts[actualIndex].value,
      };
    }
    if (
      expectedIndex < expectedParts.length &&
      distances[expectedIndex][actualIndex] === distances[expectedIndex + 1][actualIndex] + 1
    ) {
      return { kind: 'missing', expected: expectedParts[expectedIndex].value };
    }
    if (actualIndex < actualParts.length) {
      return { kind: 'extra', actual: actualParts[actualIndex].value };
    }
  }

  return null;
}
