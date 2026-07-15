import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import { getDailySummary } from '../services/dailyGoals';

export function DailyGoalsPage() {
  const { state, updateSettings } = useAppState();
  const summary = getDailySummary(state);
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Build a habit</span>
      <h1 className="display-6 fw-bold">Daily goals</h1>
      <p className="text-secondary mb-4">
        Complete small targets today and keep your Dutch moving.
      </p>
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold">Today</h2>
              <strong className="display-5">{summary.completedGoals}/3</strong>
              <p className="text-secondary">goals completed</p>
              <div className="d-flex gap-3">
                <span>
                  <i className="bi bi-fire text-warning" /> {state.progress.currentStreak} day
                  streak
                </span>
                <span>
                  <i className="bi bi-lightning text-primary" /> {summary.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <label className="form-label fw-bold" htmlFor="dailyGoal">
                Daily XP target
              </label>
              <select
                id="dailyGoal"
                className="form-select"
                value={state.settings.dailyGoal}
                onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
              >
                {[10, 20, 30, 50, 75, 100].map((value) => (
                  <option key={value} value={value}>
                    {value} XP
                  </option>
                ))}
              </select>
              <p className="small text-secondary mt-2 mb-0">
                Choose a target you can repeat consistently.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4 mb-4">
        {summary.goals.map((goal) => {
          const percent = Math.min(100, (goal.value / goal.target) * 100);
          return (
            <div className="col-12 col-md-4" key={goal.id}>
              <div
                className={`card border-0 shadow-sm h-100 ${goal.complete ? 'goal-complete' : ''}`}
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between">
                    <h2 className="h5 fw-bold">{goal.label}</h2>
                    <i
                      className={`bi ${goal.complete ? 'bi-check-circle-fill text-success' : 'bi-circle text-secondary'} fs-4`}
                    />
                  </div>
                  <p className="display-6 fw-bold mb-2">
                    {goal.value}
                    <small className="fs-6 text-secondary">
                      {' '}
                      / {goal.target}
                      {goal.id === 'accuracy' ? '%' : ''}
                    </small>
                  </p>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link className="btn btn-primary" to="/learn">
        Choose an exercise <i className="bi bi-arrow-right ms-1" />
      </Link>
    </div>
  );
}
