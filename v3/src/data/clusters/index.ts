import { misthalinTaskClusters } from './misthalin';
import { misthalinExpansionAssignments } from './misthalinExpansionAssignments';

export const taskClusters = misthalinTaskClusters.map((cluster) => {
  const addedTaskIds = misthalinExpansionAssignments[cluster.id] ?? [];
  return {
    ...cluster,
    taskIds: [...cluster.taskIds, ...addedTaskIds],
    recommendedTaskOrder: [...cluster.recommendedTaskOrder, ...addedTaskIds],
  };
});

export const taskClusterById = new Map(taskClusters.map((cluster) => [cluster.id, cluster]));
export const taskClusterByTaskId = new Map(
  taskClusters.flatMap((cluster) => cluster.taskIds.map((taskId) => [taskId, cluster] as const)),
);
