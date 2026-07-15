import { Outlet } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { OnlineStatus } from './OnlineStatus';

export function AppShell() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <OnlineStatus />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <footer className="container-fluid border-top bg-white py-3 px-4 text-secondary small">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <span>Learn at your pace. Your data stays in this browser.</span>
          <span lang="nl">Veel succes!</span>
        </div>
      </footer>
    </div>
  );
}
