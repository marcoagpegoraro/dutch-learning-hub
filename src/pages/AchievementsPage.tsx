import { useAppState } from '../app/AppStateContext';
import { achievements } from '../data/achievements';

const categoryTitles = {
  practice: 'Practice milestones',
  course: 'Course progress',
  consistency: 'Consistency',
  challenge: 'Challenges',
} as const;

export function AchievementsPage() {
  const { state } = useAppState();
  const unlocked = new Set(state.progress.achievements);
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Milestones</span>
      <h1 className="display-6 fw-bold">Achievements</h1>
      <p className="text-secondary mb-4">
        Unlocked automatically as you learn. {unlocked.size} of {achievements.length} collected.
      </p>
      <div className="progress mb-5" aria-label="Achievement progress">
        <div
          className="progress-bar"
          style={{ width: `${(unlocked.size / achievements.length) * 100}%` }}
        />
      </div>
      {Object.entries(categoryTitles).map(([category, title]) => (
        <section className="mb-5" key={category}>
          <h2 className="h4 fw-bold mb-3">{title}</h2>
          <div className="row g-4">
            {achievements
              .filter((item) => item.category === category)
              .map((item) => {
                const earned = unlocked.has(item.id);
                return (
                  <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                    <div
                      className={`card border-0 shadow-sm h-100 achievement-card ${earned ? 'unlocked' : 'locked'}`}
                    >
                      <div className="card-body p-4 d-flex align-items-center gap-3">
                        <span className="module-icon">
                          <i className={`bi ${item.icon}`} />
                        </span>
                        <div>
                          <h3 className="h5 fw-bold mb-1">{item.title}</h3>
                          <p className="text-secondary small mb-0">{item.description}</p>
                        </div>
                        <i
                          className={`bi ${earned ? 'bi-check-circle-fill text-success' : 'bi-lock-fill text-secondary'} ms-auto fs-4`}
                          aria-label={earned ? 'Unlocked' : 'Locked'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
