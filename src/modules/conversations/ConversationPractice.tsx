import { useState } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { ExerciseShell } from '../../components/ExerciseShell';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { calculateXp } from '../../services/scoring';
import type { Difficulty } from '../../types/exercise';
import {
  conversationScenarios,
  findConversationStep,
  type ConversationChoice,
  type ConversationScenario,
} from './conversationData';

interface DialogueLine {
  speaker: string;
  text: string;
  user?: boolean;
}

export function ConversationPractice() {
  const { state, updateSettings, addAttempt } = useAppState();
  const speech = useSpeechSynthesis();
  const [difficulty, setDifficulty] = useState<Difficulty>(state.settings.defaultDifficulty);
  const [scenario, setScenario] = useState<ConversationScenario | null>(null);
  const [stepId, setStepId] = useState('');
  const [history, setHistory] = useState<DialogueLine[]>([]);
  const [feedback, setFeedback] = useState<{ choice: ConversationChoice; xp: number } | null>(null);
  const [pendingStep, setPendingStep] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);

  const currentStep = scenario && stepId ? findConversationStep(scenario, stepId) : null;
  const availableScenarios = conversationScenarios.filter((item) => item.difficulty === difficulty);

  function changeDifficulty(next: Difficulty) {
    setDifficulty(next);
    updateSettings({ defaultDifficulty: next });
    setScenario(null);
    setFinished(false);
  }

  function startScenario(nextScenario: ConversationScenario) {
    const first = findConversationStep(nextScenario, nextScenario.startStep);
    setScenario(nextScenario);
    setStepId(first.id);
    setHistory([{ speaker: first.speaker, text: first.message }]);
    setFeedback(null);
    setPendingStep(null);
    setFinished(false);
    setAnswered(0);
    setSessionXp(0);
  }

  function chooseResponse(selected: ConversationChoice) {
    if (!scenario || !currentStep || feedback) return;
    const correct = selected.outcome !== 'retry';
    const xp = calculateXp(difficulty, { correct, firstAttempt: true });
    const bestAnswer =
      currentStep.choices.find((item) => item.outcome === 'best')?.text ?? selected.text;
    addAttempt({
      questionId: `conversation-${scenario.id}-${currentStep.id}`,
      moduleId: 'conversations',
      difficulty,
      prompt: currentStep.message,
      submittedAnswer: selected.text,
      correctAnswer: bestAnswer,
      correct,
      xpEarned: xp,
    });
    setHistory((current) => [...current, { speaker: 'Jij', text: selected.text, user: true }]);
    setFeedback({ choice: selected, xp });
    setPendingStep(selected.nextStep ?? (selected.outcome === 'retry' ? currentStep.id : null));
    setAnswered((current) => current + 1);
    setSessionXp((current) => current + xp);
  }

  function continueDialogue() {
    if (!scenario || !feedback) return;
    if (!pendingStep) {
      setFinished(true);
      setFeedback(null);
      return;
    }
    const next = findConversationStep(scenario, pendingStep);
    setStepId(next.id);
    setHistory((current) => [...current, { speaker: next.speaker, text: next.message }]);
    setFeedback(null);
    setPendingStep(null);
  }

  return (
    <ExerciseShell
      title="Gesprekken oefenen"
      subtitle="Work through predefined everyday conversations and receive feedback on each response."
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={{
        easy: 'Easy — introductions, shopping, and food',
        medium: 'Medium — travel, directions, and work',
        hard: 'Hard — doctor and municipality conversations',
      }}
      progressLabel={scenario ? `${answered} responses` : `${availableScenarios.length} scenarios`}
      progressPercent={scenario ? Math.min(100, answered * 34) : 0}
    >
      {!scenario ? (
        <div className="row g-4">
          {availableScenarios.map((item) => (
            <div className="col-12 col-md-6 col-xl-4" key={item.id}>
              <button
                className="card conversation-scenario border-0 shadow-sm h-100 w-100 text-start"
                type="button"
                onClick={() => startScenario(item)}
              >
                <span className="scenario-emoji" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="card-body p-4">
                  <strong className="h5 d-block">{item.title}</strong>
                  <span className="text-secondary">{item.context}</span>
                  <span className="btn btn-outline-primary mt-3">Start conversation</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <section className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between gap-3 mb-4">
                  <div>
                    <span className="eyebrow">{scenario.context}</span>
                    <h2 className="h3 fw-bold mt-1">
                      {scenario.icon} {scenario.title}
                    </h2>
                  </div>
                  <button
                    className="btn btn-outline-secondary align-self-start"
                    type="button"
                    onClick={() => setScenario(null)}
                  >
                    Change scenario
                  </button>
                </div>
                <div className="conversation-thread mb-4" aria-live="polite">
                  {history.map((line, index) => (
                    <div
                      className={`conversation-bubble ${line.user ? 'conversation-user' : 'conversation-npc'}`}
                      key={`${index}-${line.text}`}
                    >
                      <small>{line.speaker}</small>
                      <p lang="nl" className="mb-0">
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>
                {finished ? (
                  <div className="text-center py-4">
                    <i
                      className="bi bi-chat-heart-fill display-4 text-success"
                      aria-hidden="true"
                    />
                    <h3 className="h4 mt-3">Conversation complete</h3>
                    <p className="text-secondary">
                      You responded {answered} times and earned {sessionXp} XP.
                    </p>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => startScenario(scenario)}
                    >
                      Practise again
                    </button>
                  </div>
                ) : (
                  currentStep && (
                    <>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          disabled={!speech.supported || !state.settings.soundEnabled}
                          onClick={() => speech.speak(currentStep.message)}
                        >
                          <i className="bi bi-volume-up me-2" aria-hidden="true" />
                          Hear this line
                        </button>
                      </div>
                      {!feedback ? (
                        <div
                          className="d-grid gap-2"
                          role="group"
                          aria-label="Choose your response"
                        >
                          {currentStep.choices.map((response) => (
                            <button
                              className="btn btn-light border text-start p-3"
                              type="button"
                              key={response.text}
                              onClick={() => chooseResponse(response)}
                              lang="nl"
                            >
                              {response.text}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`feedback-panel ${feedback.choice.outcome === 'retry' ? 'feedback-wrong' : 'feedback-correct'}`}
                          role="status"
                        >
                          <strong>
                            {feedback.choice.outcome === 'best'
                              ? 'Excellent response'
                              : feedback.choice.outcome === 'acceptable'
                                ? 'That works'
                                : 'Try a different response'}
                          </strong>
                          <p className="mb-2">{feedback.choice.feedback}</p>
                          {feedback.xp > 0 && (
                            <span className="badge text-bg-success me-2">+{feedback.xp} XP</span>
                          )}
                          <button
                            className="btn btn-primary btn-sm"
                            type="button"
                            onClick={continueDialogue}
                          >
                            {pendingStep ? 'Continue' : 'Finish conversation'}
                          </button>
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            </section>
          </div>
          <div className="col-12 col-lg-4">
            <section className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 fw-bold">Conversation tips</h2>
                <ul className="small text-secondary ps-3 mb-0">
                  <li>Choose the response you would genuinely use.</li>
                  <li>Short answers can be correct but may sound abrupt.</li>
                  <li>Replay the other speaker before responding.</li>
                  <li>These are curated branches, not an AI conversation.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}
    </ExerciseShell>
  );
}
