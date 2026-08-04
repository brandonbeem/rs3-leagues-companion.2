import { useMemo, useState } from 'react';
import { DependencyInspector } from './DependencyInspector';
import type { ItemId, RegionId } from '../core/ids';
import { shortestPath } from '../core/navigation/graph';
import { usePlayer } from '../core/player/PlayerProvider';
import type { SkillName } from '../core/player/types';
import { isRegionUnlocked } from '../core/regions/regionEngine';
import {
  getTaskEligibility,
  isTaskAllowedInRecommendedRoutes,
  taskBlockers,
  taskStatusLabel,
} from '../core/tasks/taskEngine';
import type { TaskCategory, TaskEligibility } from '../core/tasks/types';
import type { TravelRequirement } from '../core/world/types';
import { itemById } from '../data/items';
import { tasks, taskMigrationSummary } from '../data/tasks';
import { locationById, worldData } from '../data/world';

const statusOrder: Record<TaskEligibility['status'], number> = {
  available: 0,
  'setup-needed': 1,
  blocked: 2,
  completed: 3,
};

function formatTravelTime(seconds: number | null): string {
  if (seconds === null) return 'No route recorded';
  if (seconds < 60) return `${seconds}s travel`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s travel` : `${minutes}m travel`;
}

export function TaskTracker() {
  const { player, dispatch } = usePlayer();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskEligibility['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');

  function canUseTravelRequirement(requirement: TravelRequirement): boolean {
    switch (requirement.type) {
      case 'skill':
        return (player.skills[requirement.key as SkillName] ?? 1) >= (requirement.level ?? 1);
      case 'quest':
        return player.questIds.includes(requirement.key);
      case 'item':
        return (player.inventory[requirement.key as ItemId] ?? 0) > 0;
      case 'region':
        return isRegionUnlocked(player, requirement.key as RegionId);
      case 'unlock':
        return player.unlockIds.includes(requirement.key);
      default:
        return false;
    }
  }

  const taskRows = useMemo(() => tasks.map((task) => {
    const eligibility = getTaskEligibility(task, player);
    const route = player.currentLocationId && task.locationId
      ? shortestPath(worldData.edges, player.currentLocationId, task.locationId, canUseTravelRequirement)
      : null;
    return {
      task,
      eligibility,
      route,
      location: task.locationId ? locationById.get(task.locationId) : null,
    };
  }), [player]);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.category))).sort(),
    [],
  );

  const questTaskCount = useMemo(
    () => tasks.filter((task) => task.category === 'quest').length,
    [],
  );

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return taskRows
      .filter(({ task, eligibility, location }) => {
        if (!isTaskAllowedInRecommendedRoutes(task, player)) return false;
        if (player.preferences.hideBlockedTasks && eligibility.status === 'blocked') return false;
        if (statusFilter !== 'all' && eligibility.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
        if (!query) return true;
        const haystack = [
          task.name,
          task.information,
          task.locality,
          task.category,
          task.priority,
          location?.name ?? '',
          ...task.requirements.skills.map((requirement) => `${requirement.skill} ${requirement.level}`),
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const statusDifference = statusOrder[a.eligibility.status] - statusOrder[b.eligibility.status];
        if (statusDifference !== 0) return statusDifference;
        const aTravel = a.route?.totalSeconds ?? Number.POSITIVE_INFINITY;
        const bTravel = b.route?.totalSeconds ?? Number.POSITIVE_INFINITY;
        if (aTravel !== bTravel) return aTravel - bTravel;
        return a.task.legacyTaskId - b.task.legacyTaskId;
      });
  }, [categoryFilter, player, search, statusFilter, taskRows]);

  const counts = taskRows.reduce(
    (summary, row) => ({ ...summary, [row.eligibility.status]: summary[row.eligibility.status] + 1 }),
    { available: 0, 'setup-needed': 0, blocked: 0, completed: 0 } as Record<TaskEligibility['status'], number>,
  );
  const completedPoints = taskRows
    .filter((row) => row.eligibility.status === 'completed')
    .reduce((total, row) => total + row.task.points, 0);

  return (
    <section className="page-stack task-page">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">MILESTONE 2.3 · PHASE 1</p>
          <h1>Tasks & Dependency Graphs</h1>
          <p>
            Each migrated task can now explain its skills, items, prerequisite tasks, manual content, and known preparation actions as a dependency tree.
          </p>
        </div>
        <div className="version-badge">{completedPoints} / {taskMigrationSummary.totalPoints} points</div>
      </header>

      <div className="engine-summary-grid">
        <article className="metric-card">
          <span>Migrated tasks</span>
          <strong>{taskMigrationSummary.total}</strong>
          <small>{taskMigrationSummary.verified} verified records from the first batch</small>
        </article>
        <article className="metric-card">
          <span>Available now</span>
          <strong>{counts.available}</strong>
          <small>Skill and access requirements currently met</small>
        </article>
        <article className="metric-card">
          <span>Setup needed</span>
          <strong>{counts['setup-needed']}</strong>
          <small>Dependency graphs explain the missing preparation</small>
        </article>
        <article className="metric-card">
          <span>Completed</span>
          <strong>{counts.completed}</strong>
          <small>Saved in the shared local player state</small>
        </article>
      </div>

      <div className="task-control-panel panel">
        <div className="task-filter-grid">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks, locations, skills, or activities..."
            aria-label="Search migrated tasks"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | TaskEligibility['status'])}
            aria-label="Filter task status"
          >
            <option value="all">All visible statuses</option>
            <option value="available">Available</option>
            <option value="setup-needed">Setup needed</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as 'all' | TaskCategory)}
            aria-label="Filter task category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </div>
        <label className="blocked-task-toggle">
          <input
            type="checkbox"
            checked={!player.preferences.hideBlockedTasks}
            onChange={(event) => dispatch({ type: 'set-preference', key: 'hideBlockedTasks', value: !event.target.checked })}
          />
          <span>Show blocked tasks</span>
          <small>{counts.blocked} currently hidden when this is off</small>
        </label>
        <label className="blocked-task-toggle">
          <input
            type="checkbox"
            checked={!player.preferences.avoidQuestTasks}
            onChange={(event) => dispatch({ type: 'set-preference', key: 'avoidQuestTasks', value: !event.target.checked })}
          />
          <span>Include quest tasks</span>
          <small>{questTaskCount} optional quest task{questTaskCount === 1 ? '' : 's'}; never inserted as automatic prerequisites</small>
        </label>
      </div>

      <div className="task-result-summary">
        <strong>{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'} shown</strong>
        <span>Sorted by readiness, then current-location travel estimate.</span>
      </div>

      <div className="task-card-grid">
        {visibleTasks.map(({ task, eligibility, route, location }) => {
          const blockers = taskBlockers(task, player);
          const setupSteps = task.acquisitionSteps.filter((step) => step.type === 'obtain-item' || step.type === 'train-skill');
          const actionSteps = task.acquisitionSteps.filter((step) => step.type !== 'obtain-item' && step.type !== 'train-skill');

          return (
            <article key={task.id} className={`panel task-card status-${eligibility.status}`}>
              <div className="task-card-heading">
                <div className="task-title-copy">
                  <div className="task-chip-row">
                    <span className={`task-status status-${eligibility.status}`}>{taskStatusLabel(eligibility.status)}</span>
                    <span className={`task-tier ${task.tier}`}>{task.tier}</span>
                    <span className="task-legacy-id">V20 #{task.legacyTaskId}</span>
                  </div>
                  <h2>{task.name}</h2>
                  <p>{task.information}</p>
                </div>
                <strong className="task-points">+{task.points}</strong>
              </div>

              <div className="task-location-strip">
                <div>
                  <span>Location</span>
                  <strong>{location?.name ?? 'Location pending'}</strong>
                </div>
                <div>
                  <span>From current location</span>
                  <strong>{formatTravelTime(route?.totalSeconds ?? null)}</strong>
                </div>
                <div>
                  <span>Activity</span>
                  <strong>{task.category}</strong>
                </div>
              </div>

              {(task.requirements.skills.length > 0 || task.requirements.items.length > 0) && (
                <div className="task-requirement-chips">
                  {task.requirements.skills.map((requirement) => (
                    <span className={eligibility.missingSkills.includes(requirement) ? 'missing' : 'met'} key={`${requirement.skill}-${requirement.level}`}>
                      {requirement.skill} {requirement.level}
                    </span>
                  ))}
                  {task.requirements.items.map((requirement) => (
                    <span className={eligibility.missingItems.includes(requirement) ? 'missing' : 'met'} key={requirement.itemId}>
                      {requirement.quantity}× {requirement.label ?? itemById.get(requirement.itemId)?.name ?? requirement.itemId}
                    </span>
                  ))}
                </div>
              )}

              {blockers.length > 0 && eligibility.status !== 'completed' && (
                <div className={eligibility.status === 'setup-needed' ? 'task-setup-box' : 'task-blockers'}>
                  <strong>{eligibility.status === 'setup-needed' ? 'Prepare first:' : 'Blocked by:'}</strong>
                  <span>{blockers.join(' · ')}</span>
                </div>
              )}

              {eligibility.warnings.length > 0 && eligibility.status !== 'completed' && (
                <div className="task-warning-list">
                  {eligibility.warnings.map((warning) => <span key={warning}>{warning}</span>)}
                </div>
              )}

              <DependencyInspector task={task} />

              {(setupSteps.length > 0 || actionSteps.length > 0) && (
                <details className="task-acquisition">
                  <summary>Preparation and completion steps</summary>
                  <ol>
                    {[...setupSteps, ...actionSteps].map((step) => (
                      <li key={`${step.type}-${step.label}`}>
                        <strong>{step.type.replaceAll('-', ' ')}</strong>
                        <span>{step.label}</span>
                        {step.notes && <small>{step.notes}</small>}
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              <div className="task-card-footer">
                <div>
                  <span className={`verification-label ${task.reviewStatus}`}>{task.reviewStatus.replace('-', ' ')}</span>
                  <small>{task.sources.length} source{task.sources.length === 1 ? '' : 's'} · {task.priority}</small>
                </div>
                <button
                  type="button"
                  className={eligibility.status === 'completed' ? 'primary-button selected' : 'primary-button'}
                  onClick={() => dispatch({ type: 'toggle-task', taskId: task.id })}
                >
                  {eligibility.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {visibleTasks.length === 0 && (
        <div className="panel task-empty-state">
          <h2>No tasks match these filters</h2>
          <p>Clear the search or enable optional and blocked tasks to inspect the full migrated batch.</p>
        </div>
      )}
    </section>
  );
}
