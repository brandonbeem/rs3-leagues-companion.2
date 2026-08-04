import { useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PlaceholderPage } from './components/PlaceholderPage';
import { RelicPlanner } from './components/RelicPlanner';
import { Sidebar } from './components/Sidebar';
import { relics } from './data/relics';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { PageId } from './types';

const pageContent: Record<Exclude<PageId, 'dashboard' | 'relics' | 'build'>, { title: string; eyebrow: string; description: string; nextStep: string }> = {
  tasks: {
    title: 'Task Tracker',
    eyebrow: 'LEGACY SYSTEM PRESERVED',
    description: 'The 1,000+ task database will be extracted from V20 into typed task and dependency data.',
    nextStep: 'Move task records and completion state into separate modules.',
  },
  regions: {
    title: 'Region Planner',
    eyebrow: 'NEXT MAJOR MIGRATION',
    description: 'Regions will become structured unlock data with towns, travel links, banks, NPCs, and skilling locations.',
    nextStep: 'Migrate region selection and build the first Misthalin location records.',
  },
  friends: {
    title: 'Friends',
    eyebrow: 'LOCAL-FIRST SOCIAL DATA',
    description: 'Friend builds will remain local and share-code based until a free online-sync option is genuinely useful.',
    nextStep: 'Move share codes and imported friend profiles into a dedicated data service.',
  },
  route: {
    title: 'Route Planner',
    eyebrow: 'PLANNING ENGINE',
    description: 'The route planner will use one canonical eligibility engine instead of overlapping gatekeeper functions.',
    nextStep: 'Define task, player, inventory, region, and travel context interfaces.',
  },
  strategy: {
    title: 'Strategy Center',
    eyebrow: 'DECISION SUPPORT',
    description: 'Strategy tools will consume the same typed relic, task, region, and player-state data as the route planner.',
    nextStep: 'Move relic comparisons and region recommendations into reusable selectors.',
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedRelics, setSelectedRelics] = useLocalStorage<string[]>('rs3-v3-selected-relics', []);

  const selectedRelicRecords = useMemo(
    () => selectedRelics.map((id) => relics.find((relic) => relic.id === id)).filter(Boolean),
    [selectedRelics],
  );

  function toggleRelic(id: string) {
    setSelectedRelics((current) =>
      current.includes(id) ? current.filter((relicId) => relicId !== id) : [...current, id],
    );
  }

  function renderPage() {
    if (activePage === 'dashboard') {
      return <Dashboard selectedRelics={selectedRelics.length} />;
    }

    if (activePage === 'relics') {
      return <RelicPlanner selectedRelics={selectedRelics} onToggleRelic={toggleRelic} />;
    }

    if (activePage === 'build') {
      return (
        <section className="page-stack">
          <header className="page-header">
            <div>
              <p className="eyebrow">LOCAL BUILD STATE</p>
              <h1>My Build</h1>
              <p>Your V3 selections are saved locally without requiring a paid account or database.</p>
            </div>
            <div className="version-badge">{selectedRelics.length} selected</div>
          </header>

          <article className="panel build-panel">
            {selectedRelicRecords.length === 0 ? (
              <div className="empty-state">
                <h2>No relics selected yet</h2>
                <p>Open the Relic Planner and add relics to start building your plan.</p>
                <button type="button" className="primary-button" onClick={() => setActivePage('relics')}>
                  Open Relic Planner
                </button>
              </div>
            ) : (
              <div className="build-grid">
                {selectedRelicRecords.map((relic) => relic && (
                  <article key={relic.id} className="build-card">
                    <span className={`relic-icon category-${relic.category.toLowerCase()}`}>{relic.name.slice(0, 1)}</span>
                    <div>
                      <strong>{relic.name}</strong>
                      <p>{relic.summary}</p>
                    </div>
                    <button type="button" onClick={() => toggleRelic(relic.id)}>Remove</button>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      );
    }

    const content = pageContent[activePage];
    return <PlaceholderPage {...content} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
