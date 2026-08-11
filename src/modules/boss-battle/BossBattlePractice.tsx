import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../app/AppStateContext';
import { answersForQuestion, isQuizAnswerCorrect, type QuizQuestion } from '../shared/quizUtils';
import { applyBattleAnswer, type BattleState } from './battleEngine';
import { grammarBosses, type GrammarBoss } from './bossData';

export function BossBattlePractice() {
  const { state, addAttempt, completeActivity } = useAppState();
  const [boss, setBoss] = useState<GrammarBoss | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; damage: number } | null>(null);
  const nextTurnRef = useRef<HTMLButtonElement>(null);
  const question: QuizQuestion | undefined = boss?.questions[index % boss.questions.length];

  useEffect(() => {
    if (feedback) nextTurnRef.current?.focus();
  }, [feedback]);

  function start(nextBoss: GrammarBoss) {
    setBoss(nextBoss);
    setBattle({ bossHealth: nextBoss.bossHealth, playerHealth: nextBoss.playerHealth, streak: 0 });
    setIndex(0);
    setAnswer('');
    setFeedback(null);
  }
  function submit() {
    if (!boss || !battle || !question || !answer || feedback) return;
    const correct = isQuizAnswerCorrect(question, answer);
    const turn = applyBattleAnswer(battle, correct);
    addAttempt({
      questionId: `boss-${boss.id}-${question.id}`,
      moduleId: 'boss-battle',
      difficulty: boss.difficulty,
      prompt: question.prompt,
      submittedAnswer: answer,
      correctAnswer: answersForQuestion(question)[0],
      correct,
      xpEarned: correct ? 8 : 0,
    });
    setBattle(turn.next);
    setFeedback({ correct, damage: correct ? turn.bossDamage : turn.playerDamage });
    if (turn.next.bossHealth === 0) completeActivity(`boss:defeated:${boss.id}`, 25);
  }
  if (!boss || !battle)
    return (
      <div className="container py-4 py-lg-5">
        <span className="eyebrow">Challenge mode</span>
        <h1 className="display-6 fw-bold">Grammar boss battles</h1>
        <p className="text-secondary mb-4">
          Correct answers damage the boss. Every third correct answer in a row deals bonus damage.
        </p>
        <div className="row g-4">
          {grammarBosses.map((item) => {
            const won = state.progress.completedLessons.includes(`boss:defeated:${item.id}`);
            return (
              <div className="col-12 col-lg-4" key={item.id}>
                <div className={`card border-0 shadow-sm h-100 boss-card boss-${item.difficulty}`}>
                  <div className="card-body p-4 text-center">
                    <i className={`bi ${item.icon} boss-icon`} />
                    <span className="badge text-bg-light d-block mx-auto my-3 text-capitalize">
                      {item.difficulty}
                    </span>
                    <h2 className="h4 fw-bold">{item.title}</h2>
                    <p className="text-secondary">{item.subtitle}</p>
                    {won && (
                      <p className="text-success fw-semibold">
                        <i className="bi bi-trophy-fill me-1" />
                        Defeated
                      </p>
                    )}
                    <button className="btn btn-primary" onClick={() => start(item)}>
                      {won ? 'Battle again' : 'Start battle'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  const won = battle.bossHealth === 0,
    lost = battle.playerHealth === 0;
  return (
    <div className="container py-4 py-lg-5">
      <button className="btn btn-link px-0" onClick={() => setBoss(null)}>
        <i className="bi bi-arrow-left me-1" />
        Boss selection
      </button>
      <div className="boss-arena card border-0 shadow-sm mt-3">
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <i className={`bi ${boss.icon} boss-icon`} />
            <h1 className="h2 fw-bold">{boss.title}</h1>
          </div>
          <Health label={boss.title} value={battle.bossHealth} max={boss.bossHealth} danger />
          <Health label="Your hearts" value={battle.playerHealth} max={boss.playerHealth} />
          {won || lost ? (
            <div className={`alert text-center mt-4 ${won ? 'alert-success' : 'alert-danger'}`}>
              <h2 className="h3">{won ? 'Boss defeated!' : 'Battle lost'}</h2>
              <p>
                {won
                  ? 'Your first victory over each boss awards a 25 XP bonus.'
                  : 'Review the answers and try again.'}
              </p>
              <button className="btn btn-primary" onClick={() => start(boss)}>
                {won ? 'Battle again' : 'Retry battle'}
              </button>
              {won && (
                <Link className="btn btn-link" to="/achievements">
                  View achievements
                </Link>
              )}
            </div>
          ) : (
            question && (
              <section className="bg-white rounded-4 p-3 p-md-4 mt-4">
                <div className="d-flex justify-content-between">
                  <span className="badge text-bg-primary">Streak {battle.streak}</span>
                  <span className="small text-secondary">Question {index + 1}</span>
                </div>
                <h2 className="h4 fw-bold my-3">{question.prompt}</h2>
                {question.type === 'multiple-choice' ? (
                  <div className="answer-grid">
                    {question.options.map((option) => (
                      <label
                        className={`answer-choice ${answer === option ? 'selected' : ''}`}
                        key={option}
                      >
                        <input
                          type="radio"
                          className="form-check-input"
                          name="boss-answer"
                          checked={answer === option}
                          disabled={Boolean(feedback)}
                          onChange={() => setAnswer(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    className="form-control form-control-lg"
                    value={answer}
                    disabled={Boolean(feedback)}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer"
                  />
                )}
                {feedback && (
                  <div
                    className={`alert mt-3 ${feedback.correct ? 'alert-success' : 'alert-danger'}`}
                  >
                    {feedback.correct
                      ? `Hit! ${feedback.damage} damage.`
                      : `The boss hits you. Correct answer: ${answersForQuestion(question)[0]}`}
                  </div>
                )}
                <div className="mt-3">
                  {feedback ? (
                    <button
                      ref={nextTurnRef}
                      className="btn btn-primary"
                      onClick={() => {
                        setIndex((i) => i + 1);
                        setAnswer('');
                        setFeedback(null);
                      }}
                    >
                      Next turn
                    </button>
                  ) : (
                    <button className="btn btn-success" disabled={!answer} onClick={submit}>
                      Attack
                    </button>
                  )}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Health({
  label,
  value,
  max,
  danger = false,
}: {
  label: string;
  value: number;
  max: number;
  danger?: boolean;
}) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between">
        <strong>{label}</strong>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="progress battle-health">
        <div
          className={`progress-bar ${danger ? 'bg-danger' : 'bg-success'}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
