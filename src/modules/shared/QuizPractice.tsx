import { Link } from 'react-router-dom';
import { DutchAudio } from '../../components/DutchAudio';
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
  pickUnmasteredQuizQuestion,
  remainingQuizQuestions,
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
  excludeMastered?: boolean;
  controls?: ReactNode;
  introduction?: ReactNode;
  completionLabel?: string;
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
  excludeMastered = false,
  controls,
  introduction,
  completionLabel = 'translation phrases',
  renderPromptAddon,
  renderIncorrectFeedback,
  getNextQuestion,
}: QuizPracticeProps) {
  const { state, updateSettings, addAttempt } = useAppState();
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>(
    state.settings.defaultDifficulty,
  );
  const [question, setQuestion] = useState<QuizQuestion | undefined>(() =>
    getNextQuestion
      ? getNextQuestion(state.settings.defaultDifficulty, {})
      : excludeMastered
        ? pickUnmasteredQuizQuestion(
            questions,
            state.settings.defaultDifficulty,
            state.progress.masteredItems,
          )
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
    if (feedback || !question) {
      nextQuestionRef.current?.focus();
      return;
    }

    if (question?.type === 'text') {
      textInput.current?.focus();
      textInput.current?.select();
    }
  }, [feedback, question]);

  function nextQuestion(nextDifficulty = difficulty, wasCorrect = feedback?.correct) {
    setQuestion((current) =>
      getNextQuestion
        ? getNextQuestion(nextDifficulty, { previousQuestion: current, wasCorrect })
        : excludeMastered
          ? pickUnmasteredQuizQuestion(
              questions,
              nextDifficulty === 'very-hard' ? 'hard' : nextDifficulty,
              state.progress.masteredItems,
              current?.id,
            )
          : pickQuizQuestion(
              questions,
              nextDifficulty === 'very-hard' ? 'hard' : nextDifficulty,
              current?.id,
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
    if (!question || feedback) return;
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
    if (feedback || !question) return;
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
  const progressDifficulty = difficulty === 'very-hard' ? 'hard' : difficulty;
  const total = questions.filter((item) => item.difficulty === progressDifficulty).length;
  const remaining = remainingQuizQuestions(
    questions,
    progressDifficulty,
    state.progress.masteredItems,
  );
  const completedCount = total - remaining.length;
  const levels: Difficulty[] = ['easy', 'medium', 'hard'];
  const nextDifficulty = levels
    .slice(levels.indexOf(progressDifficulty) + 1)
    .find(
      (level) => remainingQuizQuestions(questions, level, state.progress.masteredItems).length > 0,
    );
  const allComplete = questions.every((item) => state.progress.masteredItems.includes(item.id));

  const completedPhrases = excludeMastered && completedCount > 0 && (
    <details className="mt-3 text-start">
      <summary className="text-primary">View completed phrases ({completedCount})</summary>
      <ol className="mt-3 ps-3">
        {questions
          .filter(
            (item) =>
              item.difficulty === progressDifficulty &&
              state.progress.masteredItems.includes(item.id),
          )
          .map((item) => (
            <li className="mb-3" key={item.id}>
              <span className="small text-secondary d-block">{item.prompt}</span>
              <span lang="nl">{answersForQuestion(item)[0]}</span>{' '}
              <DutchAudio text={answersForQuestion(item)[0]} compact />
            </li>
          ))}
      </ol>
    </details>
  );

  if (!question)
    return (
      <ExerciseShell
        title={title}
        subtitle={subtitle}
        difficulty={difficulty}
        onDifficultyChange={changeDifficulty}
        difficultyLabels={difficultyLabels}
        controls={controls}
        progressLabel={`${completedCount} / ${total} mastered`}
        progressPercent={total ? (completedCount / total) * 100 : 100}
      >
        {introduction}
        <section className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5 text-center" role="status">
            <i className="bi bi-check-circle-fill display-4 text-success" aria-hidden="true" />
            <h2 className="h3 fw-bold mt-3">
              {allComplete
                ? `All ${completionLabel} complete!`
                : `${difficultyLabels?.[difficulty]?.split(' — ')[0] ?? difficulty} complete!`}
            </h2>
            <p className="text-secondary">
              {allComplete
                ? `You have correctly translated all available ${completionLabel} in all difficulties. Your results are saved.`
                : `You have correctly translated all ${total} phrases in this difficulty. Your correct answers are saved and will not repeat.`}
            </p>
            {nextDifficulty ? (
              <button
                ref={nextQuestionRef}
                className="btn btn-primary"
                type="button"
                onClick={() => changeDifficulty(nextDifficulty)}
              >
                Go to {difficultyLabels?.[nextDifficulty]?.split(' — ')[0] ?? nextDifficulty}{' '}
                <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
              </button>
            ) : (
              <p className="text-secondary">
                {allComplete
                  ? 'Choose another exercise to keep learning.'
                  : 'Choose another difficulty above to finish your remaining phrases.'}
              </p>
            )}
            <Link className="btn btn-outline-primary ms-2" to="/learn">
              Choose another exercise
            </Link>
            {completedPhrases}
          </div>
        </section>
      </ExerciseShell>
    );

  return (
    <ExerciseShell
      title={title}
      subtitle={subtitle}
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={difficultyLabels}
      controls={controls}
      progressLabel={
        excludeMastered
          ? `${completedCount} / ${total} mastered`
          : `${Math.min(session.answered, sessionTarget)} / ${sessionTarget}`
      }
      progressPercent={
        excludeMastered
          ? total
            ? (completedCount / total) * 100
            : 100
          : Math.min(100, (session.answered / sessionTarget) * 100)
      }
    >
      {introduction}
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
              {question.dutchAudio && (
                <div className="mb-3">
                  <DutchAudio text={question.dutchAudio} />
                </div>
              )}
              {renderPromptAddon?.(question)}

              <form onSubmit={submitAnswer} noValidate>
                {question.type === 'multiple-choice' ? (
                  <fieldset>
                    <legend className="visually-hidden">Choose an answer</legend>
                    <div className="answer-grid">
                      {question.options.map((option) => (
                        <div key={option}>
                          <label className={`answer-choice ${answer === option ? 'selected' : ''}`}>
                            <input
                              className="form-check-input"
                              type="radio"
                              disabled={Boolean(feedback)}
                              name="quizAnswer"
                              value={option}
                              checked={answer === option}
                              onChange={(event) => {
                                setAnswer(event.target.value);
                                setInvalid(false);
                              }}
                            />
                            <span lang={question.answerLanguage ?? 'nl'}>{option}</span>
                          </label>
                          <div className="mt-1">
                            {question.answerLanguage !== 'en' && (
                              <DutchAudio text={option} compact />
                            )}
                          </div>
                        </div>
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
                      answerLanguage={question.answerLanguage}
                      audioText={question.dutchAnswerAudio}
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
                      {excludeMastered && remaining.length === 0
                        ? 'Finish difficulty'
                        : 'Next question'}{' '}
                      <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
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
              {completedPhrases}
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
