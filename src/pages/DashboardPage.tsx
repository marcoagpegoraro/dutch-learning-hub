import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import { ModuleCard } from '../components/ModuleCard';
import { learningModules } from '../data/modules';
import { getAccuracy, localDateKey } from '../services/progress';

export function DashboardPage() {
  const { state } = useAppState();
  const history = state.progress.questionHistory;
  const correct = history.filter((attempt) => attempt.correct).length;
  const today = localDateKey();
  const todayAttempts = history.filter(
    (attempt) => localDateKey(new Date(attempt.answeredAt)) === today,
  );
  const todayXp = todayAttempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
  const goalPercent = Math.min(100, Math.round((todayXp / state.settings.dailyGoal) * 100));
  const recentActivity = [...history].reverse().slice(0, 4);
  const moduleStats = Object.entries(state.progress.moduleStats)
    .filter(([, stat]) => stat.attempted > 0)
    .sort(
      ([, a], [, b]) => getAccuracy(a.correct, a.attempted) - getAccuracy(b.correct, b.attempted),
    );
  const weakest = moduleStats[0];
  const recommended =
    (weakest && learningModules.find((module) => module.id === weakest[0])) ??
    learningModules.find((module) => module.id === 'articles')!;

  return (
    <div className="container py-4 py-lg-5">
      <section className="dashboard-hero mb-4 p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <span className="eyebrow">Your Dutch, one step at a time</span>
            <h1 className="display-5 fw-bold mt-2">
              Welkom, {state.profile.displayName || 'Dutch learner'}!
            </h1>
            <p className="lead text-secondary mb-4">
              A focused daily practice is enough to keep moving. Ready for another short lesson?
            </p>
            <Link className="btn btn-primary btn-lg" to={recommended.route}>
              Continue learning <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
            </Link>
          </div>
          <div className="col-lg-4">
            <div className="goal-card bg-white shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Daily goal</span>
                <span className="small text-secondary">
                  {todayXp}/{state.settings.dailyGoal} XP
                </span>
              </div>
              <div
                className="progress mb-3"
                role="progressbar"
                aria-label="Daily XP goal"
                aria-valuenow={goalPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="progress-bar" style={{ width: `${goalPercent}%` }} />
              </div>
              <p className="small text-secondary mb-0">
                {goalPercent >= 100
                  ? 'Daily goal complete — uitstekend!'
                  : `${state.settings.dailyGoal - todayXp} XP to reach today’s goal.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3 mb-5" aria-label="Learning summary">
        <StatCard
          icon="bi-fire"
          value={state.progress.currentStreak}
          label="Day streak"
          accent="orange"
        />
        <StatCard
          icon="bi-lightning-charge-fill"
          value={state.progress.totalXp}
          label="Total XP"
          accent="blue"
        />
        <StatCard
          icon="bi-check2-circle"
          value={todayAttempts.length}
          label="Done today"
          accent="green"
        />
        <StatCard
          icon="bi-bullseye"
          value={`${getAccuracy(correct, history.length)}%`}
          label="Accuracy"
          accent="purple"
        />
      </section>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-7">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 fw-bold mb-0">Recommended next</h2>
                <span className="badge text-bg-primary-subtle text-primary-emphasis">
                  A1 · {recommended.category}
                </span>
              </div>
              <div className="d-flex gap-3 align-items-start">
                <span className="module-icon">
                  <i className={`bi ${recommended.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="h5">{recommended.title}</h3>
                  <p className="text-secondary">{recommended.description}</p>
                  <Link to={recommended.route} className="btn btn-outline-primary">
                    Practice now
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-5">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold">Weakest topic</h2>
              {weakest ? (
                <>
                  <p className="mb-1 text-capitalize">{weakest[0].replaceAll('-', ' ')}</p>
                  <strong>{getAccuracy(weakest[1].correct, weakest[1].attempted)}% accuracy</strong>
                  <p className="small text-secondary mt-2 mb-0">
                    A little focused review will make this stick.
                  </p>
                </>
              ) : (
                <p className="text-secondary mb-0">
                  Complete a few questions and we’ll find the best topic to review.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="mb-5" aria-labelledby="modules-heading">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <div>
            <span className="eyebrow">Practice library</span>
            <h2 id="modules-heading" className="h2 fw-bold mb-0">
              Learning modules
            </h2>
          </div>
          <Link className="text-decoration-none" to="/learn">
            Browse by topic <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
        <div className="row g-4">
          {learningModules.map((module) => (
            <div className="col-12 col-md-6 col-xl-4" key={module.id}>
              <ModuleCard module={module} />
            </div>
          ))}
        </div>
      </section>

      <section className="card border-0 shadow-sm" aria-labelledby="activity-heading">
        <div className="card-body p-4">
          <h2 id="activity-heading" className="h4 fw-bold">
            Recent activity
          </h2>
          {recentActivity.length ? (
            <div className="list-group list-group-flush">
              {recentActivity.map((attempt) => (
                <div
                  className="list-group-item px-0 d-flex justify-content-between gap-3"
                  key={attempt.id}
                >
                  <span>
                    <i
                      className={`bi ${attempt.correct ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}
                      aria-hidden="true"
                    />
                    Time practice · <span lang="nl">{attempt.correctAnswer}</span>
                  </span>
                  <span className="text-secondary text-nowrap small">{attempt.xpEarned} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary mb-0">Your completed exercises will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: string;
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div className="col-6 col-xl-3">
      <div className="card stat-card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3 p-3 p-md-4">
          <span className={`stat-icon stat-${accent}`}>
            <i className={`bi ${icon}`} aria-hidden="true" />
          </span>
          <div>
            <strong className="fs-4 d-block lh-1">{value}</strong>
            <span className="small text-secondary">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
