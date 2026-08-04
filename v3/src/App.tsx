import { useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PlaceholderPage } from './components/PlaceholderPage';
import { RegionPlanner } from './components/RegionPlanner';
import { RelicPlanner } from './components/RelicPlanner';
import { Sidebar } from './components/Sidebar';
import { TaskTracker } from './components/TaskTracker';
import { usePlayer } from './core/player/PlayerProvider';
import { getUnlockedRegions } from './core/regions/regionEngine';
import { regions } from './data/regions';
import { relics } from './data/relics';
import { locationById } from './data/world';
import type { PageId } from './types';

const pageContent: Record<Exclude<PageId, 'dashboard' | 'tasks' | 'relics' | 'regions' | 'build'>, { title: string; eyebrow: string; description: string; nextStep: string }> = {
  friends: {
    title: 'Friends',
    eyebrow: 'LOCAL-FIRST SOCIAL DATA',
    description: 'Friend builds will remain local and share-code based until a free online-sync option is genuinely useful.',
    nextStep: 'Move share codes and imported friend profiles into a dedicated data service.',
  },
  route: {
    title: 'Route Planner',
    eyebrow: 'GRAPH ENGINE ONLINE',
    description: 'The first shortest-path graph now connects player location, region access, and provisional travel costs.',
    nextStep: 'Use the migrated early Misthalin tasks to generate the first real task route.',
  },
  strategy: {
    title: 'Strategy Center',
    eyebrow: 'DECISION SUPPORT',
    description: 'Strategy tools will consume the same player, relic, task, region, and world-graph data.',
    nextStep: 'Build selectors that compare available routes instead of sorting tasks by points.',
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const { player, dispatch } = usePlayer();
  const selectedRelics = player.selectedRelicIds;

  const selectedRelicRecords = useMemo(
    () => selectedRelics.map((id) => relics.find((relic) => relic.id === id)).filter(Boolean),
    [selectedRelics],
  );

  const currentLocationName = player.currentLocationId
    ? locationById.get(player.currentLocationId)?.name ?? 'Unknown location'
    : 'Not set';

  const unlockedRegionCount = getUnlockedRegions(player, regions).length;

  function toggleRelic(id: string) {
    dispatch({ type: 'toggle-relic', relicId: id });
  }

  function renderPage() {
    if (activePage === 'dashboard') {
      return (
        <Dashboard
          selectedRelics={selectedRelics.length}
          unlockedRegions={unlockedRegionCount}
          currentLocationName={currentLocationName}
        />
      );
    }

    if (activePage === 'tasks') return <TaskTracker />;
    if (activePage === 'relics') return <RelicPlanner selectedRelics={selectedRelics} onToggleRelic={toggleRelic} />;
    if (activePage === 'regions') return <RegionPlanner />;

    if (activePage === 'build') {
      return (
        <section className="page-stack">
          <header className="page-header">
            <div>
              <p className="eyebrow">GLOBAL PLAYER STATE</p>
              <h1>My Build</h1>
              <p>Relics, region unlocks, current location, and task progress share one local player record.</p>
            </div>
            <div className="version-badge">{selectedRelics.length} selected</div>
          </header>

          <article className="panel build-panel">
            <div className="player-state-strip">
              <div><span>Regions</span><strong>{unlockedRegionCount}</strong></div>
              <div><span>Current location</span><strong>{currentLocationName}</strong></div>
              <div><span>Completed tasks</span><strong>{player.completedTaskIds.length}</strong></div>
            </div>
            {selectedRelicRecords.length === 0 ? (
              <div className="empty-state">
                <h2>No relics selected yet</h2>
                <p>Open the Relic Planner and add relics to start building your plan.</p>
                <button type="button" className="primary-button" onClick={() => setActivePage('relics')}>Open Relic Planner</button>
              </div>
            ) : (
              <div className="build-grid">
                {selectedRelicRecords.map((relic) => relic && (
                  <article key={relic.id} className="build-card">
                    <span className={`relic-icon category-${relic.category.toLowerCase()}`}>{relic.name.slice(0, 1)}</span>
                    <div><strong>{relic.name}</strong><p>{relic.summary}</p></div>
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
