import { misthalinTaskClusters } from './misthalin';
import { misthalinExpansionAssignments } from './misthalinExpansionAssignments';
import { misthalinHardTaskClusters } from './misthalinHard';
import { misthalinEliteMasterTaskClusters } from './misthalinEliteMaster';

const baseMisthalinClusters = misthalinTaskClusters.map((cluster) => {
  const addedTaskIds = misthalinExpansionAssignments[cluster.id] ?? [];
  return {
    ...cluster,
    taskIds: [...cluster.taskIds, ...addedTaskIds],
    recommendedTaskOrder: [...cluster.recommendedTaskOrder, ...addedTaskIds],
  };
});

export const taskClusters = [
  ...baseMisthalinClusters,
  ...misthalinHardTaskClusters,
  ...misthalinEliteMasterTaskClusters,
];

export const taskClusterById = new Map(taskClusters.map((cluster) => [cluster.id, cluster]));
export const taskClusterByTaskId = new Map(
  taskClusters.flatMap((cluster) => cluster.taskIds.map((taskId) => [taskId, cluster] as const)),
);
