import { useAppState } from '../app/AppStateContext';

export function AchievementsPage() {
  const { state } = useAppState();
  const achievements = [
    {
      title: 'First step',
      description: 'Answer your first question',
      unlocked: state.progress.questionHistory.length >= 1,
      icon: 'bi-shoe-prints',
    },
    {
      title: 'Clock starter',
      description: 'Answer 10 time questions',
      unlocked: (state.progress.moduleStats.time?.attempted ?? 0) >= 10,
      icon: 'bi-clock',
    },
    {
      title: 'XP collector',
      description: 'Earn 100 XP',
      unlocked: state.progress.totalXp >= 100,
      icon: 'bi-lightning-charge',
    },
    {
      title: 'Three-day rhythm',
      description: 'Reach a 3-day streak',
      unlocked: state.progress.longestStreak >= 3,
      icon: 'bi-fire',
    },
  ];
  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Milestones</span>
      <h1 className="display-6 fw-bold">Achievements</h1>
      <p className="text-secondary mb-4">
        A small preview of the fuller achievement system planned for Phase 5.
      </p>
      <div className="row g-4">
        {achievements.map((item) => (
          <div className="col-12 col-md-6" key={item.title}>
            <div className={`card border-0 shadow-sm h-100 ${item.unlocked ? '' : 'opacity-50'}`}>
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <span className="module-icon">
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="h5 fw-bold mb-1">{item.title}</h2>
                  <p className="text-secondary small mb-0">{item.description}</p>
                </div>
                <i
                  className={`bi ${item.unlocked ? 'bi-check-circle-fill text-success' : 'bi-lock-fill text-secondary'} ms-auto fs-4`}
                  aria-label={item.unlocked ? 'Unlocked' : 'Locked'}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
