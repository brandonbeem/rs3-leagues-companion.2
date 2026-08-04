import { useMemo, useState } from 'react';
import type { LocationId, RegionId } from '../core/ids';
import { shortestPath } from '../core/navigation/graph';
import { getUnlockedRegions, isRegionUnlocked } from '../core/regions/regionEngine';
import { usePlayer } from '../core/player/PlayerProvider';
import { regions } from '../data/regions';
import { locationById, townById, worldData } from '../data/world';
import { MISHTHALIN_ID } from '../data/world/misthalin';

function formatTravelTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

export function RegionPlanner() {
  const { player, dispatch } = usePlayer();
  const [focusedRegionId, setFocusedRegionId] = useState<RegionId>(MISHTHALIN_ID);
  const [targetLocationId, setTargetLocationId] = useState<LocationId | null>(null);

  const focusedRegion = regions.find((region) => region.id === focusedRegionId) ?? regions[0];
  const focusedTowns = worldData.towns.filter((town) => town.regionId === focusedRegion.id);
  const focusedLocations = worldData.locations.filter((location) => location.regionId === focusedRegion.id);
  const currentLocation = player.currentLocationId ? locationById.get(player.currentLocationId) : null;
  const targetLocation = targetLocationId ? locationById.get(targetLocationId) : null;
  const unlockedRegions = getUnlockedRegions(player, regions);

  const routePreview = useMemo(() => {
    if (!player.currentLocationId || !targetLocationId) return null;
    return shortestPath(worldData.edges, player.currentLocationId, targetLocationId);
  }, [player.currentLocationId, targetLocationId]);

  return (
    <section className="page-stack region-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">SPRINT 1 CORE ENGINE</p>
          <h1>Region & World Planner</h1>
          <p>
            Region unlocks, locations, and travel links now share one persistent player state and one world graph.
          </p>
        </div>
        <div className="version-badge">{unlockedRegions.length} region active</div>
      </header>

      <div className="engine-summary-grid">
        <article className="metric-card">
          <span>Current location</span>
          <strong className="metric-name">{currentLocation?.name ?? 'Not set'}</strong>
          <small>Used as the starting node for route calculations</small>
        </article>
        <article className="metric-card">
          <span>World nodes</span>
          <strong>{worldData.locations.length}</strong>
          <small>First Misthalin seed locations</small>
        </article>
        <article className="metric-card">
          <span>Travel links</span>
          <strong>{worldData.edges.length}</strong>
          <small>All times are provisional until reviewed</small>
        </article>
        <article className="metric-card">
          <span>Migrated tasks</span>
          <strong>0</strong>
          <small>Schema is ready; V20 task records come next</small>
        </article>
      </div>

      <div className="region-layout">
        <aside className="panel region-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">REGION CATALOG</p>
              <h2>Unlock state</h2>
            </div>
          </div>
          <div className="region-card-list">
            {regions.map((region) => {
              const unlocked = region.starter || isRegionUnlocked(player, region.id);
              return (
                <button
                  type="button"
                  key={region.id}
                  className={focusedRegion.id === region.id ? 'region-card active' : 'region-card'}
                  onClick={() => setFocusedRegionId(region.id)}
                >
                  <span className={unlocked ? 'region-status unlocked' : 'region-status'}>{unlocked ? '✓' : '○'}</span>
                  <span>
                    <strong>{region.name}</strong>
                    <small>{region.starter ? 'Starter region' : unlocked ? 'Unlocked' : 'Locked'}</small>
                  </span>
                  <span className="region-count">{region.townIds.length}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="panel region-detail-panel">
          <div className="region-detail-header">
            <div>
              <p className="eyebrow">{focusedRegion.starter ? 'STARTER REGION' : 'UNLOCKABLE REGION'}</p>
              <h2>{focusedRegion.name}</h2>
              <p>{focusedRegion.description}</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              disabled={focusedRegion.starter}
              onClick={() => dispatch({
                type: 'set-region',
                regionId: focusedRegion.id,
                unlocked: !isRegionUnlocked(player, focusedRegion.id),
              })}
            >
              {focusedRegion.starter ? 'Always unlocked' : isRegionUnlocked(player, focusedRegion.id) ? 'Lock region' : 'Unlock region'}
            </button>
          </div>

          <div className="review-banner">
            <strong>Foundation data</strong>
            <span>Location names are seeded for the engine; services and travel times still need RS3 Wiki review.</span>
          </div>

          <div className="town-grid">
            {focusedTowns.map((town) => (
              <section className="town-card" key={town.id}>
                <div className="town-card-header">
                  <div>
                    <strong>{town.name}</strong>
                    <small>{town.locationIds.length} location node{town.locationIds.length === 1 ? '' : 's'}</small>
                  </div>
                  <span className="review-chip">Needs review</span>
                </div>
                <p>{town.description}</p>
                <div className="location-list">
                  {town.locationIds.map((locationId) => {
                    const location = locationById.get(locationId);
                    if (!location) return null;
                    const isCurrent = player.currentLocationId === location.id;
                    const isTarget = targetLocationId === location.id;
                    return (
                      <div className={isCurrent ? 'location-row current' : isTarget ? 'location-row target' : 'location-row'} key={location.id}>
                        <button type="button" className="location-focus" onClick={() => setTargetLocationId(location.id)}>
                          <strong>{location.name}</strong>
                          <small>{location.services.length ? location.services.join(' · ') : 'No services recorded yet'}</small>
                        </button>
                        <button
                          type="button"
                          className="set-location-button"
                          onClick={() => dispatch({ type: 'set-location', locationId: location.id })}
                        >
                          {isCurrent ? 'Here' : 'Set here'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <section className="route-preview-panel">
            <div className="panel-heading route-heading">
              <div>
                <p className="eyebrow">LOCATION GRAPH TEST</p>
                <h2>Shortest path preview</h2>
              </div>
              {targetLocation && <span className="version-badge muted">To {targetLocation.name}</span>}
            </div>
            {!targetLocation ? (
              <div className="route-empty">Select a location above to test the graph from your current location.</div>
            ) : !routePreview ? (
              <div className="route-empty">No accessible path is currently recorded.</div>
            ) : (
              <div className="route-result">
                <div className="route-total">
                  <span>Provisional travel estimate</span>
                  <strong>{formatTravelTime(routePreview.totalSeconds)}</strong>
                </div>
                <div className="route-node-list">
                  {routePreview.locationIds.map((locationId, index) => {
                    const location = locationById.get(locationId);
                    const town = location ? townById.get(location.townId) : null;
                    return (
                      <div className="route-node" key={`${locationId}-${index}`}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{location?.name ?? locationId}</strong>
                          <small>{town?.name ?? 'Unknown town'}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </article>
      </div>
    </section>
  );
}
