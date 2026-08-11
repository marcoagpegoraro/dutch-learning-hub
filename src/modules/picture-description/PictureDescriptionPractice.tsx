import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { ExerciseShell } from '../../components/ExerciseShell';
import { calculateXp } from '../../services/scoring';
import type { Difficulty } from '../../types/exercise';
import { PictureScene } from './PictureScene';
import { keywordCoverage, pictureTasks } from './pictureData';

function pickTask(difficulty: Difficulty, previousId?: string) {
  const tasks = pictureTasks.filter(
    (task) => task.difficulty === difficulty && task.id !== previousId,
  );
  return tasks[Math.floor(Math.random() * tasks.length)];
}

export function PictureDescriptionPractice() {
  const { state, updateSettings, addAttempt } = useAppState();
  const [difficulty, setDifficulty] = useState<Difficulty>(state.settings.defaultDifficulty);
  const [task, setTask] = useState(() => pickTask(state.settings.defaultDifficulty));
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [marked, setMarked] = useState<{ communicates: boolean; xp: number } | null>(null);
  const [completed, setCompleted] = useState(0);
  const nextTaskRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (marked) nextTaskRef.current?.focus();
  }, [marked]);

  function nextTask(nextDifficulty = difficulty) {
    setTask(pickTask(nextDifficulty, task.id));
    setAnswer('');
    setRevealed(false);
    setMarked(null);
  }

  function changeDifficulty(next: Difficulty) {
    setDifficulty(next);
    updateSettings({ defaultDifficulty: next });
    nextTask(next);
  }

  function selfMark(communicates: boolean) {
    const xp = calculateXp(difficulty, { correct: communicates, revealed: true });
    addAttempt({
      questionId: task.id,
      moduleId: 'picture-description',
      difficulty,
      prompt: task.prompt,
      submittedAnswer: answer,
      correctAnswer: task.samples.join(' / '),
      correct: communicates,
      xpEarned: xp,
    });
    setMarked({ communicates, xp });
    setCompleted((current) => current + 1);
  }

  const coverage = keywordCoverage(answer, task.keywords);

  return (
    <ExerciseShell
      title="Beschrijf de afbeelding"
      subtitle="Write freely, compare with curated examples, and mark your own communication honestly."
      difficulty={difficulty}
      onDifficultyChange={changeDifficulty}
      difficultyLabels={{
        easy: 'Easy — objects, people, and colours',
        medium: 'Medium — actions, positions, and context',
        hard: 'Hard — connected descriptions and inference',
      }}
      progressLabel={`${completed} descriptions`}
      progressPercent={Math.min(100, completed * 20)}
    >
      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="card border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <PictureScene />
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-5">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <span className="eyebrow">Description task</span>
              <h2 className="h4 fw-bold mt-2">{task.prompt}</h2>
              <div className="d-flex flex-wrap gap-2 my-3" aria-label="Suggested keywords">
                {task.keywords.map((keyword) => (
                  <span
                    className="badge rounded-pill text-bg-light text-secondary"
                    lang="nl"
                    key={keyword}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <label className="form-label fw-semibold" htmlFor="pictureAnswer">
                Your Dutch description
              </label>
              <textarea
                id="pictureAnswer"
                className="form-control"
                rows={7}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={Boolean(marked)}
                placeholder="Schrijf hier wat je ziet…"
              />
              {!revealed && (
                <button
                  className="btn btn-primary mt-3"
                  type="button"
                  disabled={!answer.trim()}
                  onClick={() => setRevealed(true)}
                >
                  Show samples and compare
                </button>
              )}
              {revealed && (
                <div className="sample-answer mt-3">
                  <div className="d-flex justify-content-between">
                    <strong>Curated examples</strong>
                    <span className="small text-secondary">Keyword coverage: {coverage}%</span>
                  </div>
                  {task.samples.map((sample) => (
                    <p className="mb-1 mt-2" lang="nl" key={sample}>
                      {sample}
                    </p>
                  ))}
                  <p className="small text-secondary mb-0 mt-2">
                    The percentage only counts suggested keywords. It does not grade grammar or
                    meaning.
                  </p>
                </div>
              )}
              {revealed && !marked && (
                <div className="mt-3">
                  <p className="fw-semibold mb-2">Does your description communicate the scene?</p>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-success"
                      type="button"
                      onClick={() => selfMark(true)}
                    >
                      Yes, it communicates
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => selfMark(false)}
                    >
                      I need more practice
                    </button>
                  </div>
                </div>
              )}
              {marked && (
                <div
                  className={`alert mt-3 ${marked.communicates ? 'alert-success' : 'alert-info'}`}
                  role="status"
                >
                  {marked.communicates
                    ? `Nice work. +${marked.xp} XP`
                    : 'Good reflection—use a sample as a pattern and try again later.'}
                  <button
                    ref={nextTaskRef}
                    className="btn btn-primary btn-sm d-block mt-2"
                    type="button"
                    onClick={() => nextTask()}
                  >
                    Next task
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ExerciseShell>
  );
}
