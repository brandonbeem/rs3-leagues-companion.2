interface DashboardProps {
  selectedRelics: number;
}

const milestones = [
  ['Foundation', 'React + TypeScript + Vite project', 'complete'],
  ['Relics', 'Typed data and modular planner', 'complete'],
  ['Regions', 'Move region data and unlock state', 'next'],
  ['Tasks', 'Move task database out of the legacy HTML', 'planned'],
  ['Route Engine', 'Canonical eligibility and world-aware routing', 'planned'],
];

export function Dashboard({ selectedRelics }: DashboardProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">MODULAR FOUNDATION</p>
          <h1>RS3 Leagues Companion V3</h1>
          <p>
            The app is being rebuilt as small, testable modules while the stable V20 site stays online.
          </p>
        </div>
        <div className="version-badge">V3 preview</div>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Relics in data layer</span>
          <strong>15</strong>
          <small>Including the five newest reveals</small>
        </article>
        <article className="metric-card">
          <span>Selected relics</span>
          <strong>{selectedRelics}</strong>
          <small>Saved locally in this browser</small>
        </article>
        <article className="metric-card">
          <span>Required paid services</span>
          <strong>$0</strong>
          <small>No paid database or hosting required</small>
        </article>
        <article className="metric-card">
          <span>Legacy app status</span>
          <strong>Safe</strong>
          <small>V20 remains on the main branch</small>
        </article>
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MIGRATION ROADMAP</p>
              <h2>One system at a time</h2>
            </div>
          </div>
          <div className="milestone-list">
            {milestones.map(([title, description, status]) => (
              <div className="milestone" key={title}>
                <span className={`milestone-dot ${status}`} />
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
                <span className={`status-label ${status}`}>{status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel architecture-panel">
          <p className="eyebrow">NEW ARCHITECTURE</p>
          <h2>Built to grow</h2>
          <div className="architecture-list">
            <div><strong>Components</strong><span>Each tab lives in its own file.</span></div>
            <div><strong>Typed data</strong><span>Relics, tasks, and regions are separate from UI code.</span></div>
            <div><strong>Local-first</strong><span>Build choices work without a paid server.</span></div>
            <div><strong>Preview-safe</strong><span>Every branch gets a Netlify test URL before merging.</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}
