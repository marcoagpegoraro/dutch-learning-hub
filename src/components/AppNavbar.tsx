import { NavLink } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';

const navItems = [
  ['/', 'Dashboard', 'bi-grid'],
  ['/course', 'A1 Course', 'bi-signpost-split'],
  ['/learn', 'Learn', 'bi-mortarboard'],
  ['/goals', 'Daily goals', 'bi-bullseye'],
  ['/review', 'Review mistakes', 'bi-arrow-repeat'],
  ['/progress', 'Progress', 'bi-graph-up-arrow'],
  ['/achievements', 'Achievements', 'bi-trophy'],
  ['/settings', 'Settings', 'bi-gear'],
  ['/about', 'About', 'bi-info-circle'],
] as const;

export function AppNavbar() {
  const { state } = useAppState();

  return (
    <header className="app-header sticky-top">
      <nav className="navbar navbar-expand bg-white border-bottom" aria-label="Main navigation">
        <div className="container-fluid px-3 px-xl-4 gap-3">
          <NavLink className="navbar-brand fw-bold text-nowrap" to="/">
            <span className="brand-mark" aria-hidden="true">
              NL
            </span>
            Dutch Learning Hub
          </NavLink>
          <div className="nav-scroll flex-grow-1">
            <ul className="navbar-nav flex-row gap-1">
              {navItems.map(([to, label, icon]) => (
                <li className="nav-item" key={to}>
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end={to === '/'}
                    to={to}
                  >
                    <i className={`bi ${icon} me-1`} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="xp-pill text-nowrap" aria-label={`${state.progress.totalXp} total XP`}>
            <i className="bi bi-lightning-charge-fill" aria-hidden="true" />{' '}
            {state.progress.totalXp} XP
          </div>
        </div>
      </nav>
    </header>
  );
}
