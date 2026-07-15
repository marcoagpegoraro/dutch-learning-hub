import { usePwaInstall } from '../hooks/usePwaInstall';

export function PwaInstallCard() {
  const { canInstall, standalone, install } = usePwaInstall();
  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4 d-flex flex-column flex-md-row gap-3 align-items-md-center">
        <span className="module-icon">
          <i className="bi bi-phone" />
        </span>
        <div className="flex-grow-1">
          <h2 className="h4 fw-bold mb-1">Install Dutch Learning Hub</h2>
          <p className="text-secondary mb-0">
            Keep the app on your home screen and practise offline after your first visit.
          </p>
        </div>
        {standalone ? (
          <span className="badge text-bg-success p-2">
            <i className="bi bi-check-lg me-1" />
            Installed
          </span>
        ) : canInstall ? (
          <button className="btn btn-primary" onClick={() => void install()}>
            <i className="bi bi-download me-1" />
            Install app
          </button>
        ) : (
          <span className="small text-secondary">
            Use your browser’s “Install app” or “Add to Home Screen” menu.
          </span>
        )}
      </div>
    </section>
  );
}
