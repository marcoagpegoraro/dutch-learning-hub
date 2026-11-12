import { savedAnswerSpeech } from '../services/savedAnswerSpeech';
import { DutchAudio } from '../components/DutchAudio';
import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import { learningModules } from '../data/modules';
import { getAccuracy, localDateKey } from '../services/progress';
import { getDailySummary } from '../services/dailyGoals';
import type { Difficulty } from '../types/exercise';

export function ProgressPage() {
  const { state } = useAppState();
  const history = state.progress.questionHistory;
  const totalCorrect = history.filter((attempt) => attempt.correct).length;
  const today = localDateKey();
  const todayAttempts = history.filter(
    (attempt) => localDateKey(new Date(attempt.answeredAt)) === today,
  );
  const todayXp = getDailySummary(state).xp;

  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Your learning data</span>
      <h1 className="display-6 fw-bold">Progress</h1>
      <p className="text-secondary mb-4">A local, private record of the work you have completed.</p>

      <div className="row g-3 mb-5">
        <ProgressStat
          value={state.progress.totalXp}
          label="Total XP"
          icon="bi-lightning-charge-fill"
        />
        <ProgressStat value={state.progress.currentStreak} label="Current streak" icon="bi-fire" />
        <ProgressStat value={state.progress.longestStreak} label="Longest streak" icon="bi-award" />
        <ProgressStat
          value={`${getAccuracy(totalCorrect, history.length)}%`}
          label="Overall accuracy"
          icon="bi-bullseye"
        />
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-5">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold">Today</h2>
              <div className="d-flex justify-content-between mb-2">
                <span>
                  {todayXp} of {state.settings.dailyGoal} XP
                </span>
                <strong>
                  {Math.min(100, Math.round((todayXp / state.settings.dailyGoal) * 100))}%
                </strong>
              </div>
              <div
                className="progress mb-3"
                role="progressbar"
                aria-label="Today's goal"
                aria-valuenow={todayXp}
                aria-valuemin={0}
                aria-valuemax={state.settings.dailyGoal}
              >
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(100, (todayXp / state.settings.dailyGoal) * 100)}%` }}
                />
              </div>
              <p className="text-secondary small mb-0">
                {todayAttempts.length} question{todayAttempts.length === 1 ? '' : 's'} completed
                today.
              </p>
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-7">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold">Accuracy by difficulty</h2>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => {
                const stat = state.progress.difficultyStats[difficulty];
                const accuracy = getAccuracy(stat.correct, stat.attempted);
                return (
                  <div className="mb-3" key={difficulty}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-capitalize fw-semibold">{difficulty}</span>
                      <span>
                        {stat.correct}/{stat.attempted} · {accuracy}%
                      </span>
                    </div>
                    <div
                      className="progress progress-thin"
                      role="progressbar"
                      aria-label={`${difficulty} accuracy`}
                      aria-valuenow={accuracy}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="progress-bar" style={{ width: `${accuracy}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <section className="card border-0 shadow-sm mb-5">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold">Module progress</h2>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Questions</th>
                  <th>Accuracy</th>
                  <th>XP</th>
                  <th>Best streak</th>
                </tr>
              </thead>
              <tbody>
                {learningModules
                  .filter((module) => module.status === 'available')
                  .map((module) => {
                    const stat = state.progress.moduleStats[module.id];
                    return (
                      <tr key={module.id}>
                        <td>
                          <i className={`bi ${module.icon} me-2 text-primary`} aria-hidden="true" />
                          {module.title}
                        </td>
                        <td>{stat?.attempted ?? 0}</td>
                        <td>{getAccuracy(stat?.correct ?? 0, stat?.attempted ?? 0)}%</td>
                        <td>{stat?.xp ?? 0}</td>
                        <td>{stat?.bestStreak ?? 0}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!history.length && (
            <div className="alert alert-light border mt-4 mb-0">
              No practice data yet.{' '}
              <Link to="/practice/time">Answer your first clock question</Link>.
            </div>
          )}
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold">Latest answers</h2>
          {history.length ? (
            <div className="list-group list-group-flush">
              {[...history]
                .reverse()
                .slice(0, 10)
                .map((attempt) => (
                  <div
                    className="list-group-item px-0 d-flex justify-content-between align-items-center gap-3"
                    key={attempt.id}
                  >
                    <div>
                      <span
                        className={`badge me-2 ${attempt.correct ? 'text-bg-success' : 'text-bg-danger'}`}
                      >
                        {attempt.correct ? 'Correct' : 'Review'}
                      </span>
                      <span lang="nl">{attempt.correctAnswer}</span>{' '}
                      <DutchAudio text={savedAnswerSpeech(attempt)} compact />
                      <small className="text-secondary ms-2">({attempt.prompt})</small>
                    </div>
                    <small className="text-secondary text-nowrap">
                      {new Date(attempt.answeredAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-secondary mb-0">Recent answers will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProgressStat({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon: string;
}) {
  return (
    <div className="col-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-4">
          <i className={`bi ${icon} fs-4 text-primary`} aria-hidden="true" />
          <strong className="display-6 fw-bold d-block mt-2">{value}</strong>
          <span className="text-secondary small">{label}</span>
        </div>
      </div>
    </div>
  );
}
