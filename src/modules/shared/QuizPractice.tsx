import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { AnswerDiff } from '../../components/AnswerDiff';
import { ExerciseShell } from '../../components/ExerciseShell';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { getAccuracy } from '../../services/progress';
import { calculateXp } from '../../services/scoring';
import type { Difficulty, ExerciseDifficulty } from '../../types/exercise';
import {
  answersForQuestion,
  evaluateQuizAnswer,
  pickQuizQuestion,
  type QuizQuestion,
} from './quizUtils';

interface QuizPracticeProps {
  moduleId: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  inputPlaceholder?: string;
  difficultyLabels?: Partial<Record<ExerciseDifficulty, string>>;
  showAnswerDiff?: boolean;
  renderPromptAddon?: (question: QuizQuestion) => ReactNode;
  renderIncorrectFeedback?: (question: QuizQuestion, submittedAnswer: string) => ReactNode;
  getNextQuestion?: (
    difficulty: ExerciseDifficulty,
    context: { previousQuestion?: QuizQuestion; wasCorrect?: boolean },
  ) => QuizQuestion;
}

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
  needsAccent: boolean;
}

export function QuizPractice({
  moduleId,
  title,
  subtitle,
  questions,
  inputPlaceholder = 'Type your answer',
  difficultyLabels,
  showAnswerDiff = false,
  renderPromptAddon,
  renderIncorrectFeedback,
  getNextQuestion,
}: QuizPracticeProps) {
  const { state, updateSettings, addAttempt } = useAppState();
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>(
    state.settings.defaultDifficulty,
  );
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    getNextQuestion
      ? getNextQuestion(state.settings.defaultDifficulty, {})
      : pickQuizQuestion(questions, state.settings.defaultDifficulty),
  );
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(state.settings.showHints);
  const [invalid, setInvalid] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [session, setSession] = useState<SessionScore>({
    correct: 0,
    wrong: 0,
    streak: 0,
    answered: 0,
    xp: 0,
  });
  const textInput = useRef<HTMLInputElement>(null);
  const nextQuestionRef = useRef<HTMLButtonElement>(null);
  const sessionTarget = 10;

  useEffect(() => {
    if (feedback) {
      nextQuestionRef.current?.focus();
      return;
    }

    if (question.type === 'text') {
      textInput.current?.focus();
      textInput.current?.select();
    }
  }, [feedback, question]);

  function nextQuestion(nextDifficulty = difficulty, wasCorrect = feedback?.correct) {
    setQuestion((current) =>
      getNextQuestion
        ? getNextQuestion(nextDifficulty, { previousQuestion: current, wasCorrect })
        : pickQuizQuestion(
            questions,
            nextDifficulty === 'very-hard' ? 'hard' : nextDifficulty,
            current.id,
          ),
    );
    setAnswer('');
    setInvalid(false);
    setFeedback(null);
  }

  function changeDifficulty(nextDifficulty: ExerciseDifficulty) {
    setDifficulty(nextDifficulty);
    updateSettings({ defaultDifficulty: nextDifficulty === 'very-hard' ? 'hard' : nextDifficulty });
    nextQuestion(nextDifficulty);
  }

  function completeAttempt(correct: boolean, submittedAnswer: string, needsAccent = false) {
    const nextStreak = correct ? session.streak + 1 : 0;
    const progressDifficulty: Difficulty = difficulty === 'very-hard' ? 'hard' : difficulty;
    const xp = calculateXp(progressDifficulty, { correct, streak: nextStreak });
    const correctAnswer = answersForQuestion(question)[0];
    addAttempt({
      questionId: question.id,
      moduleId,
      difficulty: progressDifficulty,
      prompt: question.prompt,
      submittedAnswer,
      correctAnswer,
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
    setFeedback({ correct, xp, needsAccent });
  }

  function submitAnswer(event: FormEvent) {
    event.preventDefault();
    if (feedback) return;
    if (!answer.trim()) {
      setInvalid(true);
      return;
    }
    const result = evaluateQuizAnswer(question, answer);
    completeAttempt(result.correct, answer, question.type === 'text' && result.needsAccent);
  }

  function toggleHint() {
    const next = !showHint;
    setShowHint(next);
    updateSettings({ showHints: next });
  }

  const attempts = session.correct + session.wrong;
  const moduleStats = state.progress.moduleStats[moduleId];

  return (
    <ExerciseShell
      title={title}
      subtitle={subtitle}
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={difficultyLabels}
      progressLabel={`${Math.min(session.answered, sessionTarget)} / ${sessionTarget}`}
      progressPercent={Math.min(100, (session.answered / sessionTarget) * 100)}
    >
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {question.tags
                  .filter((tag) => tag !== 'normalize-hyphens')
                  .map((tag) => (
                    <span className="badge text-bg-light text-secondary text-capitalize" key={tag}>
                      {tag.replaceAll('-', ' ')}
                    </span>
                  ))}
              </div>
              <p className="text-secondary small fw-semibold text-uppercase mb-2">Question</p>
              <h2 className="quiz-prompt fw-bold mb-4">{question.prompt}</h2>
              {renderPromptAddon?.(question)}

              <form onSubmit={submitAnswer} noValidate>
                {question.type === 'multiple-choice' ? (
                  <fieldset disabled={Boolean(feedback)}>
                    <legend className="visually-hidden">Choose an answer</legend>
                    <div className="answer-grid">
                      {question.options.map((option) => (
                        <label
                          className={`answer-choice ${answer === option ? 'selected' : ''}`}
                          key={option}
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name="quizAnswer"
                            value={option}
                            checked={answer === option}
                            onChange={(event) => {
                              setAnswer(event.target.value);
                              setInvalid(false);
                            }}
                          />
                          <span lang="nl">{option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <div>
                    <label className="form-label fw-semibold" htmlFor="quizTextAnswer">
                      Your answer
                    </label>
                    <input
                      ref={textInput}
                      id="quizTextAnswer"
                      className={`form-control form-control-lg ${invalid ? 'is-invalid' : ''}`}
                      value={answer}
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        setInvalid(false);
                      }}
                      disabled={Boolean(feedback)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={inputPlaceholder}
                    />
                  </div>
                )}

                {invalid && (
                  <p className="text-danger small mt-2 mb-0">Choose or enter an answer.</p>
                )}

                {feedback && (
                  <>
                    <FeedbackPanel
                      correct={feedback.correct}
                      correctAnswer={answersForQuestion(question)[0]}
                      explanation={
                        question.explanation ?? 'Keep practising to make this pattern automatic.'
                      }
                      xpEarned={feedback.xp}
                      needsAccent={feedback.needsAccent}
                    />
                    {showAnswerDiff && !feedback.correct && answer !== '(skipped)' && (
                      <AnswerDiff expected={answersForQuestion(question)[0]} actual={answer} />
                    )}
                    {!feedback.correct &&
                      answer !== '(skipped)' &&
                      renderIncorrectFeedback?.(question, answer)}
                  </>
                )}

                {showHint && !feedback && question.hint && (
                  <div className="alert alert-info mt-3 mb-0" role="note">
                    <strong>Hint:</strong> {question.hint}
                  </div>
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
                      <button className="btn btn-success" type="submit">
                        Check answer
                      </button>
                      {question.hint && (
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={toggleHint}
                        >
                          <i className="bi bi-lightbulb me-1" aria-hidden="true" />
                          {showHint ? 'Hide hint' : 'Show hint'}
                        </button>
                      )}
                      <button
                        className="btn btn-link text-secondary"
                        type="button"
                        onClick={() => completeAttempt(false, '(skipped)')}
                      >
                        Skip
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm">
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
        </div>
      </div>
    </ExerciseShell>
  );
}
