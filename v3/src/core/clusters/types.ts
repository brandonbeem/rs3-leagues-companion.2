import type { ClusterId, ItemId, LocationId, RegionId, TaskId } from '../ids';
import type { TaskCategory } from '../tasks/types';
import type { VerificationStatus } from '../world/types';

export type ClusterService =
  | 'bank'
  | 'lodestone'
  | 'shop'
  | 'furnace'
  | 'anvil'
  | 'range'
  | 'altar'
  | 'fishing-spot'
  | 'mine'
  | 'combat-area'
  | 'quest-hub'
  | 'runecrafting'
  | 'archaeology';

export interface TaskClusterDefinition {
  id: ClusterId;
  name: string;
  regionId: RegionId;
  centerLocationId: LocationId;
  taskIds: TaskId[];
  serviceTags: ClusterService[];
  activityTags: TaskCategory[];
  sharedItemIds: ItemId[];
  recommendedTaskOrder: TaskId[];
  estimatedInternalTravelSeconds: number | null;
  description: string;
  reviewStatus: VerificationStatus;
  notes?: string[];
}

export interface ClusterTaskSummary {
  cluster: TaskClusterDefinition;
  totalTasks: number;
  completedTasks: number;
  readyTasks: number;
  setupTasks: number;
  blockedTasks: number;
  availablePoints: number;
  estimatedActionSeconds: number;
  score: number;
  confidence: number;
  reasons: string[];
}
