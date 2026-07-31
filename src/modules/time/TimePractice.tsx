import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { ExerciseShell } from '../../components/ExerciseShell';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { isAcceptedAnswer } from '../../services/answerNormalization';
import { getAccuracy } from '../../services/progress';
import { calculateXp } from '../../services/scoring';
import type { Difficulty } from '../../types/exercise';
import type { ClockType } from '../../types/settings';
import { ClockDisplay } from './ClockDisplay';
import { generateTimeQuestion, type TimeQuestion } from './timeExpressions';

interface SessionScore {
  correct: number;
  wrong: number;
  streak: number;
  answered: number;
  xp: number;
}

interface Feedback {
  correct: boolean;
  xp: number;
}

function pickVisibleClock(clockType: ClockType): Exclude<ClockType, 'random'> {
  return clockType === 'random' ? (Math.random() < 0.5 ? 'analog' : 'digital') : clockType;
}

export function TimePractice() {
  const { state, updateSettings, addAttempt } = useAppState();
  const [difficulty, setDifficulty] = useState<Difficulty>(state.settings.defaultDifficulty);
  const [clockType, setClockType] = useState<ClockType>(state.settings.clockType);
  const [question, setQuestion] = useState<TimeQuestion>(() =>
    generateTimeQuestion(state.settings.defaultDifficulty),
  );
  const [visibleClock, setVisibleClock] = useState(() =>
    pickVisibleClock(state.settings.clockType),
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showHint, setShowHint] = useState(state.settings.showHints);
  const [invalid, setInvalid] = useState(false);
  const [session, setSession] = useState<SessionScore>({
    correct: 0,
    wrong: 0,
    streak: 0,
    answered: 0,
    xp: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const nextQuestionRef = useRef<HTMLButtonElement>(null);
  const sessionTarget = 10;

  useEffect(() => {
    if (feedback) {
      nextQuestionRef.current?.focus();
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [feedback, question]);

  function nextQuestion(nextDifficulty = difficulty, nextClockType = clockType) {
    setQuestion(generateTimeQuestion(nextDifficulty));
    setVisibleClock(pickVisibleClock(nextClockType));
    setAnswer('');
    setFeedback(null);
    setInvalid(false);
  }

  function completeAttempt(correct: boolean, submittedAnswer: string) {
    const nextStreak = correct ? session.streak + 1 : 0;
    const xp = calculateXp(difficulty, { correct, streak: nextStreak, firstAttempt: true });
    addAttempt({
      questionId: question.id,
      moduleId: 'time',
      difficulty,
      prompt: `${String(question.hour).padStart(2, '0')}:${String(question.minute).padStart(2, '0')}`,
      submittedAnswer,
      correctAnswer: question.acceptedAnswers[0],
      correct,
      xpEarned: xp,
    });
    setSession((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
      streak: correct ? current.streak + 1 : 0,
      answered: current.answered + 1,
      xp: current.xp + xp,
    }));
    setFeedback({ correct, xp });
  }

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (feedback) return;
    if (!answer.trim()) {
      setInvalid(true);
      return;
    }
    completeAttempt(isAcceptedAnswer(answer, question.acceptedAnswers), answer);
  }

  function skipQuestion() {
    if (feedback) return;
    completeAttempt(false, '(skipped)');
  }

  function changeDifficulty(value: Difficulty) {
    setDifficulty(value);
    updateSettings({ defaultDifficulty: value });
    nextQuestion(value, clockType);
  }

  function changeClockType(value: ClockType) {
    setClockType(value);
    updateSettings({ clockType: value });
    nextQuestion(difficulty, value);
  }

  function toggleHint() {
    const next = !showHint;
    setShowHint(next);
    updateSettings({ showHints: next });
  }

  const attempts = session.correct + session.wrong;
  const moduleStats = state.progress.moduleStats.time;

  return (
    <ExerciseShell
      title="Hoe laat is het?"
      subtitle="Look at the clock and type the time in Dutch."
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      progressLabel={`${Math.min(session.answered, sessionTarget)} / ${sessionTarget}`}
      progressPercent={Math.min(100, (session.answered / sessionTarget) * 100)}
      difficultyLabels={{
        easy: 'Easy — full and half hours',
        medium: 'Medium — 5-minute intervals',
        hard: 'Hard — any minute',
      }}
      controls={
        <>
          <label className="form-label fw-semibold" htmlFor="clockType">
            Clock type
          </label>
          <select
            id="clockType"
            className="form-select"
            value={clockType}
            onChange={(event) => changeClockType(event.target.value as ClockType)}
          >
            <option value="analog">Analog clock</option>
            <option value="digital">Digital clock</option>
            <option value="random">Random</option>
          </select>
        </>
      }
    >
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-md-5">
              <ClockDisplay
                hour={question.hour}
                minute={question.minute}
                clockType={visibleClock}
              />

              <form onSubmit={submitAnswer} noValidate>
                <label className="form-label fw-semibold" htmlFor="timeAnswer">
                  Write the time in Dutch
                </label>
                <div className="input-group input-group-lg">
                  <input
                    ref={inputRef}
                    id="timeAnswer"
                    className={`form-control ${invalid ? 'is-invalid' : ''}`}
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setInvalid(false);
                    }}
                    disabled={Boolean(feedback)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="e.g. twintig voor twaalf"
                    aria-describedby="answerHelp"
                    required
                  />
                  <button className="btn btn-success" type="submit" disabled={Boolean(feedback)}>
                    Check
                  </button>
                </div>
                <div id="answerHelp" className="form-text">
                  Capitalization and optional final punctuation do not matter.
                </div>
              </form>

              {feedback && (
                <FeedbackPanel
                  correct={feedback.correct}
                  correctAnswer={question.acceptedAnswers[0]}
                  explanation={question.explanation}
                  xpEarned={feedback.xp}
                />
              )}

              <div className="d-flex flex-wrap gap-2 mt-3">
                {feedback ? (
                  <button
                    ref={nextQuestionRef}
                    className="btn btn-primary"
                    type="button"
                    onClick={() => nextQuestion()}
                  >
                    Next question <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <button className="btn btn-outline-primary" type="button" onClick={toggleHint}>
                      <i className="bi bi-lightbulb me-1" aria-hidden="true" />
                      {showHint ? 'Hide hint' : 'Show hint'}
                    </button>
                    <button
                      className="btn btn-link text-secondary"
                      type="button"
                      onClick={skipQuestion}
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>

              {showHint && !feedback && (
                <div className="alert alert-info mt-3 mb-0" role="note">
                  <strong>Hint:</strong> {question.hint}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 fw-bold mb-0">Session score</h2>
                <span className="badge rounded-pill text-bg-primary">{session.xp} XP</span>
              </div>
              <div className="score-grid">
                <div>
                  <span className="score-value">{session.correct}</span>
                  <span className="score-label">Correct</span>
                </div>
                <div>
                  <span className="score-value">{session.wrong}</span>
                  <span className="score-label">Wrong</span>
                </div>
                <div>
                  <span className="score-value">{session.streak}</span>
                  <span className="score-label">Streak</span>
                </div>
                <div>
                  <span className="score-value">{getAccuracy(session.correct, attempts)}%</span>
                  <span className="score-label">Accuracy</span>
                </div>
              </div>
              {moduleStats && (
                <p className="text-secondary small mt-3 mb-0">
                  All-time: {moduleStats.correct}/{moduleStats.attempted} correct · {moduleStats.xp}{' '}
                  XP
                </p>
              )}
            </div>
          </section>

          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold">Dutch clock guide</h2>
              <ul className="small mb-0 ps-3 time-guide">
                <li>
                  <strong>:00</strong> → <span lang="nl">elf uur</span>
                </li>
                <li>
                  <strong>:15</strong> → <span lang="nl">kwart over elf</span>
                </li>
                <li>
                  <strong>:30</strong> → <span lang="nl">half twaalf</span>
                </li>
                <li>
                  <strong>:45</strong> → <span lang="nl">kwart voor twaalf</span>
                </li>
                <li>
                  <span lang="nl">Half twaalf</span> means 11:30.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </ExerciseShell>
  );
}
