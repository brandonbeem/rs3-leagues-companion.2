import { misthalinTaskClusters } from './misthalin';

export const taskClusters = [...misthalinTaskClusters];
export const taskClusterById = new Map(taskClusters.map((cluster) => [cluster.id, cluster]));
export const taskClusterByTaskId = new Map(
  taskClusters.flatMap((cluster) => cluster.taskIds.map((taskId) => [taskId, cluster] as const)),
);
