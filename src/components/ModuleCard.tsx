import { Link } from 'react-router-dom';
import type { LearningModule } from '../types/exercise';

export function ModuleCard({ module }: { module: LearningModule }) {
  const available = module.status === 'available';
  return (
    <article
      className={`card module-card border-0 shadow-sm h-100 ${available ? '' : 'module-card-muted'}`}
    >
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <span className="module-icon" aria-hidden="true">
            <i className={`bi ${module.icon}`} />
          </span>
          <span
            className={`badge ${available ? 'text-bg-success' : 'text-bg-light text-secondary'}`}
          >
            {available ? 'Available' : 'Coming soon'}
          </span>
        </div>
        <h3 className="h5 fw-bold">{module.title}</h3>
        <p className="text-secondary small flex-grow-1">{module.description}</p>
        <Link
          className={`btn ${available ? 'btn-primary' : 'btn-outline-secondary'} stretched-link`}
          to={module.route}
          aria-label={`${available ? 'Start' : 'View'} ${module.title}`}
        >
          {available ? 'Start practice' : 'View details'}
        </Link>
      </div>
    </article>
  );
}
