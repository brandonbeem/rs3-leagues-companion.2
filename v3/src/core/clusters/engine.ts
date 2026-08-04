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
  const actionable = statuses.filter(({ eligibility }) =>
    eligibility.status === 'available' || eligibility.status === 'setup-needed',
  );
  const readyTasks = statuses.filter(({ eligibility }) => eligibility.status === 'available').length;
  const setupTasks = statuses.filter(({ eligibility }) => eligibility.status === 'setup-needed').length;
  const blockedTasks = statuses.filter(({ eligibility }) => eligibility.status === 'blocked').length;
  const availablePoints = actionable.reduce((total, { task }) => total + task.points, 0);
  const estimatedActionSeconds = actionable.reduce(
    (total, { task }) => total + (task.estimatedSeconds ?? 300),
    cluster.estimatedInternalTravelSeconds ?? 120,
  );
  const reviewCount = actionable.filter(({ task }) => task.reviewStatus !== 'verified').length;
  const setupPenalty = setupTasks * 30;
  const blockedPenalty = blockedTasks * 20;
  const reviewPenalty = reviewCount * 25;
  const timePenalty = Math.round(estimatedActionSeconds / 20);
  const score = Math.max(
    0,
    availablePoints * 10 + readyTasks * 35 + actionable.length * 20
      - setupPenalty - blockedPenalty - reviewPenalty - timePenalty,
  );
  const confidence = actionable.length === 0
    ? 0
    : Math.max(35, Math.round(100 - (reviewCount / actionable.length) * 40 - (blockedTasks > 0 ? 10 : 0)));
  const reasons: string[] = [];
  if (readyTasks > 0) reasons.push(`${readyTasks} ready now`);
  if (availablePoints > 0) reasons.push(`${availablePoints} available points`);
  if (setupTasks > 0) reasons.push(`${setupTasks} need setup`);
  if (cluster.serviceTags.includes('bank')) reasons.push('bank nearby');
  if (reviewCount > 0) reasons.push(`${reviewCount} route detail${reviewCount === 1 ? '' : 's'} need review`);

  return {
    cluster,
    totalTasks: clusterTasks.length,
    completedTasks: statuses.filter(({ eligibility }) => eligibility.status === 'completed').length,
    readyTasks,
    setupTasks,
    blockedTasks,
    availablePoints,
    estimatedActionSeconds,
    score,
    confidence,
    reasons,
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
      if (a.score !== b.score) return b.score - a.score;
      if (a.confidence !== b.confidence) return b.confidence - a.confidence;
      if (a.availablePoints !== b.availablePoints) return b.availablePoints - a.availablePoints;
      return a.cluster.name.localeCompare(b.cluster.name);
    });
}
