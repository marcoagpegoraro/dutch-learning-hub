import { normalizeAnswer } from './answerNormalization';

export type DiffKind = 'same' | 'missing' | 'extra';

export interface DiffPart {
  kind: DiffKind;
  value: string;
}

export function diffAnswers(expected: string, actual: string): DiffPart[] {
  const expectedWords = normalizeAnswer(expected).split(' ').filter(Boolean);
  const actualWords = normalizeAnswer(actual).split(' ').filter(Boolean);
  const lengths = Array.from({ length: expectedWords.length + 1 }, () =>
    Array<number>(actualWords.length + 1).fill(0),
  );

  for (let expectedIndex = expectedWords.length - 1; expectedIndex >= 0; expectedIndex -= 1) {
    for (let actualIndex = actualWords.length - 1; actualIndex >= 0; actualIndex -= 1) {
      lengths[expectedIndex][actualIndex] =
        expectedWords[expectedIndex] === actualWords[actualIndex]
          ? lengths[expectedIndex + 1][actualIndex + 1] + 1
          : Math.max(
              lengths[expectedIndex + 1][actualIndex],
              lengths[expectedIndex][actualIndex + 1],
            );
    }
  }

  const parts: DiffPart[] = [];
  let expectedIndex = 0;
  let actualIndex = 0;
  while (expectedIndex < expectedWords.length || actualIndex < actualWords.length) {
    if (
      expectedIndex < expectedWords.length &&
      actualIndex < actualWords.length &&
      expectedWords[expectedIndex] === actualWords[actualIndex]
    ) {
      parts.push({ kind: 'same', value: expectedWords[expectedIndex] });
      expectedIndex += 1;
      actualIndex += 1;
    } else if (
      expectedIndex < expectedWords.length &&
      (actualIndex >= actualWords.length ||
        lengths[expectedIndex + 1][actualIndex] >= lengths[expectedIndex][actualIndex + 1])
    ) {
      parts.push({ kind: 'missing', value: expectedWords[expectedIndex] });
      expectedIndex += 1;
    } else {
      parts.push({ kind: 'extra', value: actualWords[actualIndex] });
      actualIndex += 1;
    }
  }
  return parts;
}
