import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { ExerciseShell } from '../../components/ExerciseShell';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { getAccuracy } from '../../services/progress';
import { calculateXp } from '../../services/scoring';
import type { Difficulty } from '../../types/exercise';
import { wordOrderQuestions } from './wordOrderData';
import { isCorrectWordOrder, pickOrderingQuestion } from './wordOrderUtils';

interface TokenChoice {
  id: number;
  value: string;
}
interface SessionScore {
  correct: number;
  wrong: number;
  streak: number;
  answered: number;
  xp: number;
}

export function WordOrderPractice() {
  const { state, updateSettings, addAttempt } = useAppState();
  const [difficulty, setDifficulty] = useState<Difficulty>(state.settings.defaultDifficulty);
  const [question, setQuestion] = useState(() =>
    pickOrderingQuestion(wordOrderQuestions, state.settings.defaultDifficulty),
  );
  const [chosenIds, setChosenIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; xp: number } | null>(null);
  const [showHint, setShowHint] = useState(state.settings.showHints);
  const [invalid, setInvalid] = useState(false);
  const [session, setSession] = useState<SessionScore>({
    correct: 0,
    wrong: 0,
    streak: 0,
    answered: 0,
    xp: 0,
  });
  const nextQuestionRef = useRef<HTMLButtonElement>(null);
  const tokens: TokenChoice[] = question.tokens.map((value, id) => ({ id, value }));
  const chosen = chosenIds.map((id) => tokens[id]);
  const available = tokens.filter((token) => !chosenIds.includes(token.id));

  useEffect(() => {
    if (feedback) nextQuestionRef.current?.focus();
  }, [feedback]);

  function nextQuestion(nextDifficulty = difficulty) {
    setQuestion(pickOrderingQuestion(wordOrderQuestions, nextDifficulty, question.id));
    setChosenIds([]);
    setFeedback(null);
    setInvalid(false);
  }

  function changeDifficulty(nextDifficulty: Difficulty) {
    setDifficulty(nextDifficulty);
    updateSettings({ defaultDifficulty: nextDifficulty });
    nextQuestion(nextDifficulty);
  }

  function chooseToken(id: number) {
    if (feedback) return;
    setChosenIds((current) => [...current, id]);
    setInvalid(false);
  }

  function removeToken(index: number) {
    if (feedback) return;
    setChosenIds((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveToken(fromIndex: number, toIndex: number) {
    if (feedback || fromIndex === toIndex) return;
    setChosenIds((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function insertToken(id: number, index: number) {
    if (feedback || chosenIds.includes(id)) return;
    setChosenIds((current) => {
      const next = [...current];
      next.splice(index, 0, id);
      return next;
    });
    setInvalid(false);
  }

  function dragPayload(event: DragEvent<HTMLElement>): string {
    return event.dataTransfer.getData('text/plain');
  }

  function dropOnSentence(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const payload = dragPayload(event);
    if (payload.startsWith('available:')) chooseToken(Number(payload.split(':')[1]));
    if (payload.startsWith('chosen:'))
      moveToken(Number(payload.split(':')[1]), chosenIds.length - 1);
  }

  function dropAtIndex(event: DragEvent<HTMLButtonElement>, targetIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    const payload = dragPayload(event);
    if (payload.startsWith('available:')) insertToken(Number(payload.split(':')[1]), targetIndex);
    if (payload.startsWith('chosen:')) moveToken(Number(payload.split(':')[1]), targetIndex);
  }

  function complete(correct: boolean, submitted: string) {
    const nextStreak = correct ? session.streak + 1 : 0;
    const xp = calculateXp(difficulty, { correct, streak: nextStreak });
    addAttempt({
      questionId: question.id,
      moduleId: 'word-order',
      difficulty,
      prompt: question.prompt,
      submittedAnswer: submitted,
      correctAnswer: question.correctOrder.join(' '),
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

  function checkOrder() {
    if (chosen.length !== tokens.length) {
      setInvalid(true);
      return;
    }
    const values = chosen.map((token) => token.value);
    complete(isCorrectWordOrder(values, question.correctOrder), values.join(' '));
  }

  const attempts = session.correct + session.wrong;
  const moduleStats = state.progress.moduleStats['word-order'];

  return (
    <ExerciseShell
      title="Zinsbouw"
      subtitle="Put the words in the correct Dutch order using click or keyboard controls."
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={{
        easy: 'Easy — subject + verb + object',
        medium: 'Medium — inversion, modals, and negation',
        hard: 'Hard — subordinate clauses and sentence brackets',
      }}
      progressLabel={`${Math.min(session.answered, 10)} / 10`}
      progressPercent={Math.min(100, session.answered * 10)}
    >
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <span className="badge text-bg-light text-secondary text-capitalize mb-3">
                {question.tags.join(' · ')}
              </span>
              <p className="text-secondary small fw-semibold text-uppercase mb-2">
                Build the sentence
              </p>
              <h2 className="quiz-prompt fw-bold mb-4">{question.prompt}</h2>
              <div
                className={`word-order-zone mb-4 ${invalid ? 'word-order-invalid' : ''} ${feedback && !feedback.correct ? 'word-order-wrong' : ''}`}
                aria-label="Your sentence"
                onDragOver={(event) => event.preventDefault()}
                onDrop={dropOnSentence}
              >
                {chosen.length ? (
                  chosen.map((token, index) => {
                    const misplaced = Boolean(
                      feedback && !feedback.correct && token.value !== question.correctOrder[index],
                    );
                    return (
                      <button
                        className={`btn word-token ${misplaced ? 'word-token-misplaced' : ''}`}
                        type="button"
                        key={`${token.id}-${index}`}
                        onClick={() => removeToken(index)}
                        disabled={Boolean(feedback)}
                        draggable={!feedback}
                        onDragStart={(event) =>
                          event.dataTransfer.setData('text/plain', `chosen:${index}`)
                        }
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => dropAtIndex(event, index)}
                        aria-label={`Remove ${token.value}`}
                      >
                        <span lang="nl">{token.value}</span>
                      </button>
                    );
                  })
                ) : (
                  <span className="text-secondary">Choose words below to build your answer…</span>
                )}
              </div>
              <div
                className="word-bank mb-3"
                aria-label="Available words"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const payload = dragPayload(event);
                  if (payload.startsWith('chosen:')) removeToken(Number(payload.split(':')[1]));
                }}
              >
                {available.map((token) => (
                  <button
                    className="btn btn-outline-primary word-token"
                    type="button"
                    key={token.id}
                    onClick={() => chooseToken(token.id)}
                    disabled={Boolean(feedback)}
                    draggable={!feedback}
                    onDragStart={(event) =>
                      event.dataTransfer.setData('text/plain', `available:${token.id}`)
                    }
                  >
                    <span lang="nl">{token.value}</span>
                  </button>
                ))}
              </div>
              {invalid && (
                <p className="text-danger small">Use every word before checking your answer.</p>
              )}
              {showHint && !feedback && (
                <div className="alert alert-info">
                  <strong>Hint:</strong> {question.hint}
                </div>
              )}
              {feedback && (
                <FeedbackPanel
                  correct={feedback.correct}
                  correctAnswer={question.correctOrder.join(' ')}
                  explanation={question.explanation ?? ''}
                  xpEarned={feedback.xp}
                />
              )}
              <div className="d-flex flex-wrap gap-2 mt-4">
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
                    <button className="btn btn-success" type="button" onClick={checkOrder}>
                      Check order
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setChosenIds((current) => current.slice(0, -1))}
                      disabled={!chosenIds.length}
                    >
                      Undo
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => {
                        const next = !showHint;
                        setShowHint(next);
                        updateSettings({ showHints: next });
                      }}
                    >
                      <i className="bi bi-lightbulb me-1" aria-hidden="true" />
                      {showHint ? 'Hide hint' : 'Show hint'}
                    </button>
                    <button
                      className="btn btn-link text-secondary"
                      type="button"
                      onClick={() => complete(false, '(skipped)')}
                    >
                      Skip
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-3">
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
        </div>
      </div>
    </ExerciseShell>
  );
}
