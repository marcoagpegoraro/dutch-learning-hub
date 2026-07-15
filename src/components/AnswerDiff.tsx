import { diffAnswers } from '../services/answerDiff';

export function AnswerDiff({ expected, actual }: { expected: string; actual: string }) {
  const parts = diffAnswers(expected, actual);
  return (
    <div
      className="answer-diff mt-3"
      aria-label="Difference between your answer and the expected answer"
    >
      <p className="small fw-semibold mb-2">Answer comparison</p>
      <div className="d-flex flex-wrap gap-1" lang="nl">
        {parts.map((part, index) => (
          <span
            className={`diff-word diff-${part.kind}`}
            key={`${part.kind}-${index}-${part.value}`}
          >
            {part.kind === 'missing' && <span aria-hidden="true">− </span>}
            {part.kind === 'extra' && <span aria-hidden="true">+ </span>}
            {part.value}
          </span>
        ))}
      </div>
      <p className="small text-secondary mt-2 mb-0">
        Red words were missing; amber words were extra.
      </p>
    </div>
  );
}
