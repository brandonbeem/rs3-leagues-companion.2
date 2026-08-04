import { worldData, worldVerificationSummary } from '../data/world';

interface DashboardProps {
  selectedRelics: number;
}

const milestones = [
  ['Foundation', 'React + TypeScript + Vite project', 'complete'],
  ['Relics', 'Typed data and modular planner', 'complete'],
  ['Core Engine', 'Persistent player, region, task, and graph systems', 'complete'],
  ['Misthalin', 'Sourced towns, services, restrictions, and travel topology', 'complete'],
  ['Task Migration', 'Move verified early Misthalin tasks into the new schema', 'next'],
];

export function Dashboard({ selectedRelics }: DashboardProps) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">MODULAR FOUNDATION</p>
          <h1>RS3 Leagues Companion V3</h1>
          <p>
            The app is being rebuilt as small, testable systems while the stable V20 site stays online.
          </p>
        </div>
        <div className="version-badge">Milestone 2.1</div>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Relics in data layer</span>
          <strong>15</strong>
          <small>{selectedRelics} selected in the shared player state</small>
        </article>
        <article className="metric-card">
          <span>Verified world nodes</span>
          <strong>{worldVerificationSummary.verifiedLocations}</strong>
          <small>{worldData.locations.length} total Misthalin location records</small>
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
          <p className="eyebrow">WORLD DATA QUALITY</p>
          <h2>Trust is visible</h2>
          <div className="architecture-list">
            <div><strong>{worldVerificationSummary.verifiedTowns} sourced areas</strong><span>Lumbridge through the Archaeology Campus are now structured.</span></div>
            <div><strong>{worldVerificationSummary.verifiedLocations} verified nodes</strong><span>Location existence and major services have source references.</span></div>
            <div><strong>{worldVerificationSummary.needsReviewLocations} review nodes</strong><span>These remain excluded from trusted production routing.</span></div>
            <div><strong>{worldVerificationSummary.provisionalEdges} provisional timings</strong><span>Travel topology is recorded; exact seconds still need in-game measurement.</span></div>
          </div>
        </article>
      </div>
    </section>
  );
}
