import { Link, useParams } from 'react-router-dom';
import { findModule } from '../data/modules';

export function PlaceholderModulePage() {
  const { moduleId } = useParams();
  const module = findModule(moduleId);

  if (!module) return <NotFoundPage />;

  return (
    <div className="container py-5">
      <div className="placeholder-panel text-center mx-auto p-4 p-md-5">
        <span className="module-icon module-icon-large">
          <i className={`bi ${module.icon}`} aria-hidden="true" />
        </span>
        <span className="badge text-bg-light text-secondary mt-4">Coming in a later phase</span>
        <h1 className="display-6 fw-bold mt-3">{module.title}</h1>
        <p className="lead text-secondary">{module.description}</p>
        <p className="text-secondary">
          This typed placeholder reserves the route and module identity. No exercise content has
          been implemented yet.
        </p>
        <Link className="btn btn-primary mt-2" to="/learn">
          <i className="bi bi-arrow-left me-2" aria-hidden="true" />
          Back to modules
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-6 fw-bold">Page not found</h1>
      <p className="text-secondary">This route does not exist in the learning hub.</p>
      <Link className="btn btn-primary" to="/">
        Go to dashboard
      </Link>
    </div>
  );
}
