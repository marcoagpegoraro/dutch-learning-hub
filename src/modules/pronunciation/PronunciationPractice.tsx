import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { ExerciseShell } from '../../components/ExerciseShell';
import { DutchAudio } from '../../components/DutchAudio';
import { calculateXp } from '../../services/scoring';
import type { Difficulty } from '../../types/exercise';
import { pronunciationPhrases, recognitionMatchPercent } from './pronunciationData';

interface RecognitionResultEventLike {
  results: { 0: { 0: { transcript: string } } };
}

interface RecognitionErrorEventLike {
  error: string;
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => RecognitionLike;

function recognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function pickPhrase(difficulty: Difficulty, previousId?: string) {
  const phrases = pronunciationPhrases.filter(
    (item) => item.difficulty === difficulty && item.id !== previousId,
  );
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function PronunciationPractice() {
  const { state, updateSettings, addAttempt } = useAppState();
  const Recognition = recognitionConstructor();
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(state.settings.defaultDifficulty);
  const [phrase, setPhrase] = useState(() => pickPhrase(state.settings.defaultDifficulty));
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(0);
  const nextPhraseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  useEffect(() => {
    if (saved) nextPhraseRef.current?.focus();
  }, [saved]);

  function nextPhrase(nextDifficulty = difficulty) {
    recognitionRef.current?.abort();
    setPhrase(pickPhrase(nextDifficulty, phrase.id));
    setTranscript('');
    setError('');
    setSaved(false);
    setListening(false);
  }

  function changeDifficulty(next: Difficulty) {
    setDifficulty(next);
    updateSettings({ defaultDifficulty: next });
    nextPhrase(next);
  }

  function startRecognition() {
    if (!Recognition) return;
    setError('');
    setTranscript('');
    const recognition = new Recognition();
    recognition.lang = 'nl-NL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setTranscript(event.results[0][0].transcript);
    recognition.onerror = (event) => setError(`Speech recognition error: ${event.error}.`);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  const match = transcript ? recognitionMatchPercent(phrase.phrase, transcript) : 0;

  function saveAttempt() {
    if (!transcript || saved) return;
    const correct = match >= 70;
    const xp = calculateXp(difficulty, { correct });
    addAttempt({
      questionId: phrase.id,
      moduleId: 'pronunciation',
      difficulty,
      prompt: phrase.phrase,
      submittedAnswer: transcript,
      correctAnswer: phrase.phrase,
      correct,
      xpEarned: xp,
    });
    setSaved(true);
    setCompleted((current) => current + 1);
  }

  return (
    <ExerciseShell
      title="Uitspraak shadowing"
      subtitle="Listen, repeat, and optionally compare browser speech recognition with the expected phrase."
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={{
        easy: 'Easy — short everyday phrases',
        medium: 'Medium — complete sentences',
        hard: 'Hard — longer rhythm and clause patterns',
      }}
      progressLabel={`${completed} recordings`}
      progressPercent={Math.min(100, completed * 20)}
    >
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5 text-center">
              <span className="badge text-bg-warning mb-3">Experimental browser feature</span>
              <p className="text-secondary small fw-semibold text-uppercase">Expected phrase</p>
              <h2 className="display-6 fw-bold" lang="nl">
                {phrase.phrase}
              </h2>
              <p className="text-secondary">Focus: {phrase.focus}</p>
              <div className="d-flex flex-wrap justify-content-center gap-2 my-4">
                <DutchAudio text={phrase.phrase} />
                <button
                  className={`btn ${listening ? 'btn-danger' : 'btn-primary'}`}
                  type="button"
                  disabled={!Recognition || listening}
                  onClick={startRecognition}
                >
                  <i className="bi bi-mic-fill me-2" aria-hidden="true" />
                  {listening ? 'Listening…' : 'Record with browser'}
                </button>
              </div>
              {!Recognition && (
                <div className="alert alert-warning text-start">
                  Speech recognition is unavailable in this browser. Playback and self-directed
                  shadowing still work. Recognition is commonly available in Chromium-based browsers
                  but may require permission and an internet connection.
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {transcript && (
                <div className="recognition-result text-start">
                  <p className="small fw-semibold mb-1">Browser transcript</p>
                  <p className="h5" lang="nl">
                    {transcript}
                  </p>
                  <div
                    className="progress mb-2"
                    role="progressbar"
                    aria-label="Recognition text match"
                    aria-valuenow={match}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="progress-bar" style={{ width: `${match}%` }} />
                  </div>
                  <strong>{match}% text match</strong>
                  <p className="small text-secondary mt-2 mb-0">
                    This only measures how closely browser recognition matched the expected words.
                    It is not a pronunciation assessment and may reflect microphone, accent,
                    network, or browser errors.
                  </p>
                </div>
              )}
              {transcript && !saved && (
                <button className="btn btn-success mt-3" type="button" onClick={saveAttempt}>
                  Save this practice attempt
                </button>
              )}
              {saved && (
                <button
                  ref={nextPhraseRef}
                  className="btn btn-primary mt-3"
                  type="button"
                  onClick={() => nextPhrase()}
                >
                  Next phrase
                </button>
              )}
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold">How to shadow</h2>
              <ol className="small text-secondary ps-3 mb-0">
                <li>Listen once at normal speed.</li>
                <li>Replay slowly and notice rhythm.</li>
                <li>Repeat the whole phrase, not isolated words.</li>
                <li>Use recognition only as a rough transcript check.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </ExerciseShell>
  );
}
