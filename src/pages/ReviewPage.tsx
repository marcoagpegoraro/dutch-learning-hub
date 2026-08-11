import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import { evaluateAcceptedAnswer } from '../services/answerNormalization';

export function ReviewPage() {
  const { state, reviewMistake } = useAppState();
  const [includeFuture, setIncludeFuture] = useState(false);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [messageNeedsAccent, setMessageNeedsAccent] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const now = Date.now();
  const allItems = [...state.review.items].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const dueItems = allItems.filter((item) => new Date(item.dueAt).getTime() <= now);
  const practiceItems = includeFuture ? allItems : dueItems;
  const current = practiceItems[0];

  function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!current || !answer.trim()) {
      setInvalid(true);
      return;
    }
    const result = evaluateAcceptedAnswer(answer, [current.correctAnswer]);
    reviewMistake(current.id, result.correct ? 'correct' : 'again');
    setMessage(
      result.correct
        ? result.needsAccent
          ? `Correct — add the accent or diaeresis in “${current.correctAnswer}” next time.`
          : `Correct — “${current.correctAnswer}” is scheduled for a longer interval.`
        : `Review again soon. The answer is “${current.correctAnswer}”.`,
    );
    setMessageNeedsAccent(result.needsAccent);
    setAnswer('');
    setInvalid(false);
  }

  function markKnown() {
    if (!current) return;
    reviewMistake(current.id, 'known');
    setMessage(`Marked “${current.correctAnswer}” as known.`);
    setMessageNeedsAccent(false);
    setAnswer('');
  }

  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Turn errors into progress</span>
      <h1 className="display-6 fw-bold">Review mistakes</h1>
      <p className="text-secondary mb-4">
        Practise due mistakes with intervals of 1, 3, 7, 14, and 30 days.
      </p>
      {message && (
        <div
          className={`alert ${messageNeedsAccent ? 'alert-warning' : 'alert-info'}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              {current ? (
                <>
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                    <div>
                      <span className="badge text-bg-warning mb-2">
                        {current.wrongCount}× missed
                      </span>
                      <p className="text-secondary small fw-semibold text-uppercase mb-2">
                        Recall the correct answer
                      </p>
                      <h2 className="h3 fw-bold mb-0">{current.prompt}</h2>
                    </div>
                    <span className="badge text-bg-light text-secondary text-capitalize">
                      {current.moduleId.replaceAll('-', ' ')}
                    </span>
                  </div>
                  <form onSubmit={submitReview}>
                    <label className="form-label fw-semibold" htmlFor="reviewAnswer">
                      Your answer
                    </label>
                    <input
                      id="reviewAnswer"
                      className={`form-control form-control-lg ${invalid ? 'is-invalid' : ''}`}
                      value={answer}
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        setInvalid(false);
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      autoFocus
                    />
                    {invalid && <p className="text-danger small mt-2">Enter an answer first.</p>}
                    <div className="d-flex flex-wrap gap-2 mt-4">
                      <button className="btn btn-success" type="submit">
                        Check answer
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          reviewMistake(current.id, 'again');
                          setMessage(
                            `“${current.correctAnswer}” will return later in this session.`,
                          );
                          setMessageNeedsAccent(false);
                          setAnswer('');
                        }}
                      >
                        Show answer / again
                      </button>
                      <button
                        className="btn btn-link text-secondary"
                        type="button"
                        onClick={markKnown}
                      >
                        Mark as known
                      </button>
                    </div>
                  </form>
                </>
              ) : allItems.length ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-check display-4 text-success" aria-hidden="true" />
                  <h2 className="h4 mt-3">All due reviews are complete</h2>
                  <p className="text-secondary">
                    Your next item is due {new Date(allItems[0].dueAt).toLocaleString()}.
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={() => setIncludeFuture(true)}
                  >
                    Review ahead
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check2-circle display-4 text-success" aria-hidden="true" />
                  <h2 className="h4 mt-3">Nothing to review</h2>
                  <p className="text-secondary">
                    Mistakes from any practice module will appear here automatically.
                  </p>
                  <Link className="btn btn-primary" to="/learn">
                    Choose an exercise
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold">Review queue</h2>
              <div className="score-grid">
                <div>
                  <span className="score-value">{dueItems.length}</span>
                  <span className="score-label">Due now</span>
                </div>
                <div>
                  <span className="score-value">{allItems.length}</span>
                  <span className="score-label">Total items</span>
                </div>
              </div>
              <p className="text-secondary small mt-3 mb-0">
                A wrong answer returns in about ten minutes. Correct recall increases the interval.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
