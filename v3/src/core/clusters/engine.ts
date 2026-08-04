import type { PlayerState } from '../player/types';
import { getTaskEligibility, isTaskAllowedInRecommendedRoutes } from '../tasks/taskEngine';
import type { TaskDefinition } from '../tasks/types';
import type { ClusterTaskSummary, TaskClusterDefinition } from './types';

export function summarizeTaskCluster(
  cluster: TaskClusterDefinition,
  tasks: TaskDefinition[],
  player: PlayerState,
): ClusterTaskSummary {
  const taskIds = new Set(cluster.taskIds);
  const clusterTasks = tasks.filter((task) => taskIds.has(task.id));
  const eligibleTasks = clusterTasks.filter((task) => isTaskAllowedInRecommendedRoutes(task, player));
  const statuses = eligibleTasks.map((task) => ({ task, eligibility: getTaskEligibility(task, player) }));

  return {
    cluster,
    totalTasks: clusterTasks.length,
    completedTasks: statuses.filter(({ eligibility }) => eligibility.status === 'completed').length,
    readyTasks: statuses.filter(({ eligibility }) => eligibility.status === 'available').length,
    setupTasks: statuses.filter(({ eligibility }) => eligibility.status === 'setup-needed').length,
    blockedTasks: statuses.filter(({ eligibility }) => eligibility.status === 'blocked').length,
    availablePoints: statuses
      .filter(({ eligibility }) => eligibility.status === 'available' || eligibility.status === 'setup-needed')
      .reduce((total, { task }) => total + task.points, 0),
  };
}

export function summarizeTaskClusters(
  clusters: TaskClusterDefinition[],
  tasks: TaskDefinition[],
  player: PlayerState,
): ClusterTaskSummary[] {
  return clusters
    .map((cluster) => summarizeTaskCluster(cluster, tasks, player))
    .sort((a, b) => {
      const aActionable = a.readyTasks + a.setupTasks;
      const bActionable = b.readyTasks + b.setupTasks;
      if (aActionable !== bActionable) return bActionable - aActionable;
      if (a.availablePoints !== b.availablePoints) return b.availablePoints - a.availablePoints;
      return a.cluster.name.localeCompare(b.cluster.name);
    });
}
