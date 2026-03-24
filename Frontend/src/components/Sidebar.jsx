import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <h2>AI PM</h2>
      <Link
        to="/"
        className={isActive('/') ? 'active' : ''}
      >
        Dashboard
      </Link>
      <Link
        to="/scope"
        className={isActive('/scope') ? 'active' : ''}
      >
        Scope
      </Link>
      <Link
        to="/requirements"
        className={isActive('/requirements') ? 'active' : ''}
      >
        Requirements
      </Link>
      <Link
        to="/tasks"
        className={isActive('/tasks') ? 'active' : ''}
      >
        Tasks
      </Link>
      <Link
        to="/gantt"
        className={isActive('/gantt') ? 'active' : ''}
      >
        Gantt
      </Link>
      <Link
        to="/risks"
        className={isActive('/risks') ? 'active' : ''}
      >
        Risks
      </Link>
    </div>
  );
}
