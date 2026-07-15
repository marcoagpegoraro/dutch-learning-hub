import { useAppState } from '../../app/AppStateContext';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { QuizPractice } from '../shared/QuizPractice';
import { listeningQuestions, spokenTextForQuestion } from './listeningData';

export function ListeningPractice() {
  const { state } = useAppState();
  const speech = useSpeechSynthesis();

  return (
    <QuizPractice
      moduleId="listening"
      title="Luistertraining"
      subtitle="Listen to browser-generated Dutch speech, then choose or type what you hear."
      questions={listeningQuestions}
      inputPlaceholder="Type exactly what you hear"
      difficultyLabels={{
        easy: 'Easy — choose the matching phrase',
        medium: 'Medium — type everyday sentences',
        hard: 'Hard — details, prices, and longer speech',
      }}
      renderPromptAddon={(question) => (
        <div className="listening-controls mb-4">
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-primary btn-lg"
              type="button"
              disabled={!speech.supported || !state.settings.soundEnabled}
              onClick={() => speech.speak(spokenTextForQuestion(question.id))}
            >
              <i
                className={`bi ${speech.speaking ? 'bi-soundwave' : 'bi-play-fill'} me-2`}
                aria-hidden="true"
              />
              Play Dutch audio
            </button>
            <button
              className="btn btn-outline-primary"
              type="button"
              disabled={!speech.supported || !state.settings.soundEnabled}
              onClick={() => speech.speak(spokenTextForQuestion(question.id), 0.68)}
            >
              <i className="bi bi-speedometer me-2" aria-hidden="true" />
              Slower
            </button>
          </div>
          {!speech.supported && (
            <div className="alert alert-warning mt-3 mb-0">
              Speech synthesis is unavailable in this browser. You can still reveal the phrase
              through feedback, but listening playback requires Web Speech synthesis.
            </div>
          )}
          {!state.settings.soundEnabled && (
            <div className="alert alert-light border mt-3 mb-0">Sound is disabled in Settings.</div>
          )}
        </div>
      )}
    />
  );
}
