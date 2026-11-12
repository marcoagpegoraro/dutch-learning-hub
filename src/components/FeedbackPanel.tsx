import { DutchAudio } from './DutchAudio';
interface FeedbackPanelProps {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpEarned: number;
  needsAccent?: boolean;
  audioText?: string;
  answerLanguage?: 'nl' | 'en';
}

export function FeedbackPanel({
  correct,
  correctAnswer,
  explanation,
  xpEarned,
  needsAccent = false,
  audioText,
  answerLanguage = 'nl',
}: FeedbackPanelProps) {
  return (
    <div
      className={`feedback-panel mt-4 ${correct ? (needsAccent ? 'feedback-accent' : 'feedback-correct') : 'feedback-wrong'}`}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex gap-3">
        <i
          className={`bi ${correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-4`}
          aria-hidden="true"
        />
        <div>
          <h2 className="h5 fw-bold mb-1">
            {correct ? (needsAccent ? 'Correct — check the accents' : 'Correct!') : 'Not quite yet'}
          </h2>
          <p className="mb-1">
            The answer is <strong lang={answerLanguage}>{correctAnswer}</strong>.
          </p>
          {(audioText || answerLanguage === 'nl') && (
            <DutchAudio text={audioText ?? correctAnswer} />
          )}
          {needsAccent && (
            <p className="small mb-1">
              Your answer was accepted; add the accent or dieresis next time.
            </p>
          )}
          <p className="small mb-0">{explanation}</p>
          {xpEarned > 0 && <span className="badge text-bg-success mt-2">+{xpEarned} XP</span>}
        </div>
      </div>
    </div>
  );
}
