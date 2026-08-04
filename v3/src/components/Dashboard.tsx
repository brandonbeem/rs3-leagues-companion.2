interface DashboardProps {
  selectedRelics: number;
  unlockedRegions: number;
  currentLocationName: string;
}

const milestones = [
  ['Foundation', 'React + TypeScript + Vite project', 'complete'],
  ['Player State', 'One persistent record shared by every page', 'complete'],
  ['Region Engine', 'Unlock state and accessible-content selectors', 'complete'],
  ['World Graph', 'Misthalin nodes and shortest-path routing', 'complete'],
  ['Tasks', 'Migrate verified V20 task requirements and locations', 'next'],
  ['Route Engine', 'Score efficient routes using requirements and travel', 'planned'],
];

export function Dashboard({ selectedRelics, unlockedRegions, currentLocationName }: DashboardProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">SPRINT 1 CORE ENGINE</p>
          <h1>RS3 Leagues Companion V3</h1>
          <p>
            Player state, region access, stable IDs, task schemas, and the first world-location graph now work together.
          </p>
        </div>
        <div className="version-badge">Sprint 1 preview</div>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Selected relics</span>
          <strong>{selectedRelics}</strong>
          <small>Stored inside the shared player record</small>
        </article>
        <article className="metric-card">
          <span>Unlocked regions</span>
          <strong>{unlockedRegions}</strong>
          <small>Misthalin is protected as a starter region</small>
        </article>
        <article className="metric-card">
          <span>Current location</span>
          <strong className="metric-name">{currentLocationName}</strong>
          <small>The route graph now has a real starting node</small>
        </article>
        <article className="metric-card">
          <span>Required paid services</span>
          <strong>$0</strong>
          <small>State remains local-first and Netlify-hosted</small>
        </article>
      </div>

      <div className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SPRINT 1 STATUS</p>
              <h2>Core systems before content volume</h2>
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
          <p className="eyebrow">ENGINE FLOW</p>
          <h2>World → Player → Task</h2>
          <div className="architecture-list">
            <div><strong>Stable IDs</strong><span>Regions, towns, locations, tasks, and items no longer depend on display text.</span></div>
            <div><strong>Player Store</strong><span>Relics, regions, skills, location, tasks, inventory, and preferences share one source.</span></div>
            <div><strong>Region Engine</strong><span>Locked-region content can be filtered consistently across every future page.</span></div>
            <div><strong>Location Graph</strong><span>Routes can compare travel cost instead of sorting by task points.</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}
