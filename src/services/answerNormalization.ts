export interface NormalizationOptions {
  normalizeHyphens?: boolean;
}

export interface AnswerMatch {
  correct: boolean;
  needsAccent: boolean;
  matchingAnswer?: string;
}

export function normalizeAnswer(
  value: string,
  { normalizeHyphens = false }: NormalizationOptions = {},
): string {
  let normalized = value
    .toLocaleLowerCase('nl-NL')
    .replace(/[‘’‛`]/g, "'")
    .trim()
    .replace(/[.!?]+$/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (normalizeHyphens) {
    normalized = normalized
      .replace(/[‐‑‒–—-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return normalized;
}

export function isAcceptedAnswer(
  submitted: string,
  acceptedAnswers: string[],
  options?: NormalizationOptions,
): boolean {
  return evaluateAcceptedAnswer(submitted, acceptedAnswers, options).correct;
}

function removeDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}

export function evaluateAcceptedAnswer(
  submitted: string,
  acceptedAnswers: string[],
  options?: NormalizationOptions,
): AnswerMatch {
  const normalizedSubmission = normalizeAnswer(submitted, options);
  const exactMatch = acceptedAnswers.find(
    (answer) => normalizeAnswer(answer, options) === normalizedSubmission,
  );
  if (exactMatch) return { correct: true, needsAccent: false, matchingAnswer: exactMatch };

  const accentlessSubmission = removeDiacritics(normalizedSubmission);
  const accentMatch = acceptedAnswers.find(
    (answer) => removeDiacritics(normalizeAnswer(answer, options)) === accentlessSubmission,
  );
  return accentMatch
    ? { correct: true, needsAccent: true, matchingAnswer: accentMatch }
    : { correct: false, needsAccent: false };
}
