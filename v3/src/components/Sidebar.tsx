import type { PageId } from '../types';

const navItems: Array<{ id: PageId; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'tasks', label: 'Task Tracker', icon: '☑' },
  { id: 'relics', label: 'Relic Planner', icon: '◇' },
  { id: 'regions', label: 'Regions', icon: '⌘' },
  { id: 'build', label: 'My Build', icon: '◆' },
  { id: 'friends', label: 'Friends', icon: '♙' },
  { id: 'route', label: 'Route Planner', icon: '➜' },
  { id: 'strategy', label: 'Strategy Center', icon: '◎' },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">RS</div>
        <div>
          <strong>RS3 Leagues</strong>
          <span>Companion V3</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-pill"><span /> V3 foundation preview</div>
        <p>Free stack: React, TypeScript, Vite, GitHub, and Netlify.</p>
      </div>
    </aside>
  );
}
