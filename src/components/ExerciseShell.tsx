import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Difficulty } from '../types/exercise';

interface ExerciseShellProps {
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  progressLabel: string;
  progressPercent: number;
  controls?: ReactNode;
  difficultyLabels?: Record<Difficulty, string>;
  children: ReactNode;
}

export function ExerciseShell({
  title,
  subtitle,
  difficulty,
  onDifficultyChange,
  progressLabel,
  progressPercent,
  controls,
  difficultyLabels = {
    easy: 'Easy — recognition and strong hints',
    medium: 'Medium — recall and transformations',
    hard: 'Hard — production and fewer hints',
  },
  children,
}: ExerciseShellProps) {
  return (
    <div className="container py-4 py-lg-5">
      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-end mb-4">
        <div>
          <Link className="small text-decoration-none" to="/">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Dashboard
          </Link>
          <h1 className="display-6 fw-bold mt-2 mb-1">{title}</h1>
          <p className="text-secondary mb-0">{subtitle}</p>
        </div>
        <Link className="btn btn-outline-secondary align-self-start" to="/">
          Exit session
        </Link>
      </div>

      <section className="card border-0 shadow-sm mb-4" aria-label="Exercise options">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold" htmlFor="exerciseDifficulty">
                Difficulty
              </label>
              <select
                id="exerciseDifficulty"
                className="form-select"
                value={difficulty}
                onChange={(event) => onDifficultyChange(event.target.value as Difficulty)}
              >
                <option value="easy">{difficultyLabels.easy}</option>
                <option value="medium">{difficultyLabels.medium}</option>
                <option value="hard">{difficultyLabels.hard}</option>
              </select>
            </div>
            <div className="col-12 col-md-4">{controls}</div>
            <div className="col-12 col-md-4">
              <div className="d-flex justify-content-between small mb-2">
                <span className="fw-semibold">Session progress</span>
                <span>{progressLabel}</span>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-label="Session progress"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}
