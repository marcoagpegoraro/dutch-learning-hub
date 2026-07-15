import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import {
  a1Course,
  courseCheckpointId,
  courseUnitProgress,
  isCourseUnitUnlocked,
} from '../data/a1Course';

export function CoursePage() {
  const { state } = useAppState();
  const completed = state.progress.completedLessons;
  const unitsDone = a1Course.filter((unit) =>
    completed.includes(courseCheckpointId(unit.id)),
  ).length;
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Guided learning path</span>
      <h1 className="display-6 fw-bold">A1 Dutch course</h1>
      <p className="text-secondary">
        Follow 16 short units in order. Each one has two lessons and a checkpoint.
      </p>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between">
            <strong>{unitsDone} of 16 units complete</strong>
            <span>{Math.round((unitsDone / 16) * 100)}%</span>
          </div>
          <div className="progress mt-2">
            <div className="progress-bar" style={{ width: `${(unitsDone / 16) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="course-path">
        {a1Course.map((unit, index) => {
          const unlocked = isCourseUnitUnlocked(index, completed);
          const progress = courseUnitProgress(unit, completed);
          return (
            <article
              className={`card border-0 shadow-sm course-unit ${unlocked ? '' : 'opacity-50'}`}
              key={unit.id}
            >
              <div className="card-body p-4 d-flex gap-3 align-items-center">
                <span className={`course-number ${progress === 100 ? 'complete' : ''}`}>
                  {progress === 100 ? <i className="bi bi-check-lg" /> : unit.number}
                </span>
                <div className="flex-grow-1">
                  <span className="small text-secondary">Unit {unit.number}</span>
                  <h2 className="h5 fw-bold mb-1">
                    <i className={`bi ${unit.icon} me-2`} />
                    {unit.title}
                  </h2>
                  <p className="text-secondary small mb-2">{unit.description}</p>
                  <div className="progress course-progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {unlocked ? (
                  <Link className="btn btn-outline-primary text-nowrap" to={`/course/${unit.id}`}>
                    {progress ? 'Continue' : 'Start'}
                  </Link>
                ) : (
                  <i className="bi bi-lock-fill fs-4 text-secondary" aria-label="Locked" />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
