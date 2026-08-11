import type { ReactNode } from 'react';
import { findNumberWordDifference } from './numberFeedback';

export function NumberAnswerHint({ expected, actual }: { expected: string; actual: string }) {
  const difference = findNumberWordDifference(expected, actual);
  if (!difference) return null;

  let message: ReactNode;
  if (difference.kind === 'replace') {
    message = (
      <>
        You wrote <strong lang="nl">{difference.actual}</strong>; this part should be{' '}
        <strong lang="nl">{difference.expected}</strong>.
      </>
    );
  } else if (difference.kind === 'missing') {
    message = (
      <>
        Add <strong lang="nl">{difference.expected}</strong> in that position.
      </>
    );
  } else {
    message = (
      <>
        Remove <strong lang="nl">{difference.actual}</strong> from that position.
      </>
    );
  }

  return (
    <div className="alert alert-warning mt-3 mb-0" role="status">
      <strong>Where it changed:</strong> {message}
    </div>
  );
}
