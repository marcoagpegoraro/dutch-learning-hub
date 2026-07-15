export interface NormalizationOptions {
  normalizeHyphens?: boolean;
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
  const normalizedSubmission = normalizeAnswer(submitted, options);
  return acceptedAnswers.some(
    (answer) => normalizeAnswer(answer, options) === normalizedSubmission,
  );
}
