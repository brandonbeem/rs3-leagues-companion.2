import { useMemo } from 'react';
import { summarizeTaskClusters } from '../core/clusters/engine';
import { usePlayer } from '../core/player/PlayerProvider';
import { taskClusters } from '../data/clusters';
import { tasks } from '../data/tasks';

export function ClusterOverview() {
  const { player } = usePlayer();
  const summaries = useMemo(
    () => summarizeTaskClusters(taskClusters, tasks, player),
    [player],
  );
  const populated = summaries.filter((summary) => summary.totalTasks > 0);
  const readyAreas = populated.filter((summary) => summary.readyTasks + summary.setupTasks > 0);

  return (
    <section className="panel cluster-overview">
      <div className="cluster-overview-heading">
        <div>
          <p className="eyebrow">ROUTE CLUSTER FRAMEWORK</p>
          <h2>Misthalin route areas</h2>
          <p>Tasks are now grouped by the place a player should visit, not merely sorted as unrelated rows.</p>
        </div>
        <div className="cluster-overview-total">
          <strong>{readyAreas.length}</strong>
          <span>active areas</span>
        </div>
      </div>

      <div className="cluster-overview-list">
        {populated.slice(0, 5).map((summary) => (
          <article key={summary.cluster.id} className="cluster-overview-item">
            <div>
              <strong>{summary.cluster.name}</strong>
              <span>{summary.readyTasks} ready · {summary.setupTasks} setup · {summary.completedTasks} done</span>
            </div>
            <div className="cluster-overview-points">+{summary.availablePoints}</div>
          </article>
        ))}
      </div>

      <details className="cluster-overview-details">
        <summary>View all {taskClusters.length} defined route areas</summary>
        <div>
          {summaries.map((summary) => (
            <span key={summary.cluster.id}>
              <strong>{summary.cluster.name}</strong>
              {summary.totalTasks > 0 ? `${summary.totalTasks} migrated task${summary.totalTasks === 1 ? '' : 's'}` : 'Ready for the next task wave'}
            </span>
          ))}
        </div>
      </details>
    </section>
  );
}
