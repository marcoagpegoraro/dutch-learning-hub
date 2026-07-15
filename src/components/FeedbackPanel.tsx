interface FeedbackPanelProps {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpEarned: number;
}

export function FeedbackPanel({
  correct,
  correctAnswer,
  explanation,
  xpEarned,
}: FeedbackPanelProps) {
  return (
    <div
      className={`feedback-panel mt-4 ${correct ? 'feedback-correct' : 'feedback-wrong'}`}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex gap-3">
        <i
          className={`bi ${correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-4`}
          aria-hidden="true"
        />
        <div>
          <h2 className="h5 fw-bold mb-1">{correct ? 'Correct!' : 'Not quite yet'}</h2>
          <p className="mb-1">
            The answer is <strong lang="nl">{correctAnswer}</strong>.
          </p>
          <p className="small mb-0">{explanation}</p>
          {xpEarned > 0 && <span className="badge text-bg-success mt-2">+{xpEarned} XP</span>}
        </div>
      </div>
    </div>
  );
}
