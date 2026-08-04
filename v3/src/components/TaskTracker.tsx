import { useMemo, useState } from 'react';
import { usePlayer } from '../core/player/PlayerProvider';
import { getTaskEligibility, taskBlockers } from '../core/tasks/taskEngine';
import { misthalinEarlyTasks } from '../data/tasks/misthalinEarly';
import { locationById } from '../data/world';

export function TaskTracker() {
  const { player, dispatch } = usePlayer();
  const [showBlocked, setShowBlocked] = useState(false);
  const [search, setSearch] = useState('');

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return misthalinEarlyTasks.filter((task) => {
      const eligibility = getTaskEligibility(task, player);
      if (!showBlocked && !eligibility.available && !player.completedTaskIds.includes(task.id)) return false;
      if (!query) return true;
      return `${task.name} ${task.locality} ${task.category}`.toLowerCase().includes(query);
    });
  }, [player, search, showBlocked]);

  const availableCount = misthalinEarlyTasks.filter((task) => getTaskEligibility(task, player).available).length;
  const completedCount = misthalinEarlyTasks.filter((task) => player.completedTaskIds.includes(task.id)).length;
  const completedPoints = misthalinEarlyTasks
    .filter((task) => player.completedTaskIds.includes(task.id))
    .reduce((total, task) => total + task.points, 0);

  return (
    <section className="page-stack">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">MILESTONE 2.2</p>
          <h1>Early Misthalin Tasks</h1>
          <p>Official Catalyst tasks are now linked to player levels, inventory requirements, and world locations.</p>
        </div>
        <div className="version-badge">{completedPoints} points</div>
      </header>

      <div className="engine-summary-grid">
        <article className="metric-card"><span>Migrated tasks</span><strong>{misthalinEarlyTasks.length}</strong><small>First verified Catalyst batch</small></article>
        <article className="metric-card"><span>Available now</span><strong>{availableCount}</strong><small>Based on current player state</small></article>
        <article className="metric-card"><span>Completed</span><strong>{completedCount}</strong><small>Saved locally in your browser</small></article>
        <article className="metric-card"><span>Hidden blocked tasks</span><strong>{showBlocked ? 0 : misthalinEarlyTasks.length - visibleTasks.length}</strong><small>Matches your preferred clean view</small></article>
      </div>

      <div className="filter-bar task-filter-bar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search migrated tasks..." />
        <button type="button" className="secondary-button" onClick={() => setShowBlocked((value) => !value)}>
          {showBlocked ? 'Hide blocked tasks' : 'Show blocked tasks'}
        </button>
      </div>

      <div className="task-card-grid">
        {visibleTasks.map((task) => {
          const completed = player.completedTaskIds.includes(task.id);
          const eligibility = getTaskEligibility(task, player);
          const blockers = taskBlockers(task, player);
          const location = task.locationId ? locationById.get(task.locationId) : null;

          return (
            <article key={task.id} className={`panel task-card ${completed ? 'completed' : eligibility.available ? 'available' : 'blocked'}`}>
              <div className="task-card-heading">
                <div>
                  <span className={`task-tier ${task.tier}`}>{task.tier}</span>
                  <h2>{task.name}</h2>
                  <p>{task.locality}</p>
                </div>
                <strong className="task-points">+{task.points}</strong>
              </div>

              <div className="task-meta-row">
                <span>{location?.name ?? 'Location pending'}</span>
                <span>{task.category}</span>
                <span className={task.reviewStatus === 'verified' ? 'verified-text' : 'review-text'}>{task.reviewStatus}</span>
              </div>

              {!completed && blockers.length > 0 && (
                <div className="task-blockers"><strong>Needs:</strong> {blockers.join(' · ')}</div>
              )}

              {task.acquisitionSteps.length > 0 && (
                <details className="task-acquisition">
                  <summary>Acquisition and route steps</summary>
                  <ol>{task.acquisitionSteps.map((step) => <li key={step.label}>{step.label}</li>)}</ol>
                </details>
              )}

              <button
                type="button"
                className={completed ? 'primary-button selected' : 'primary-button'}
                onClick={() => dispatch({ type: 'toggle-task', taskId: task.id })}
              >
                {completed ? 'Mark incomplete' : 'Mark complete'}
              </button>
            </article>
          );
        })}
      </div>

      {visibleTasks.length === 0 && <div className="panel route-empty">No tasks match the current filters.</div>}
    </section>
  );
}
