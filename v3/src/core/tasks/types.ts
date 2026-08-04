import type { ItemId, LocationId, RegionId, TaskId } from '../ids';
import type { SkillName } from '../player/types';

export type TaskCategory =
  | 'skilling'
  | 'combat'
  | 'quest'
  | 'exploration'
  | 'economy'
  | 'collection'
  | 'bossing'
  | 'other';

export interface SkillRequirement {
  skill: SkillName;
  level: number;
  boostable?: boolean;
}

export interface ItemRequirement {
  itemId: ItemId;
  quantity: number;
  consumed?: boolean;
  mustBeOwnedBeforeRoute?: boolean;
}

export interface TaskRequirements {
  skills: SkillRequirement[];
  items: ItemRequirement[];
  quests: string[];
  unlocks: string[];
  completedTaskIds: TaskId[];
}

export interface TaskDefinition {
  id: TaskId;
  name: string;
  description: string;
  category: TaskCategory;
  regionId: RegionId;
  locationId: LocationId | null;
  requirements: TaskRequirements;
  recommendedItemIds: ItemId[];
  estimatedSeconds: number | null;
  routePolicy: 'normal' | 'requires-item-owned' | 'manual-only' | 'blocked-review';
  reviewStatus: 'verified' | 'needs-review';
  sourceUrl?: string;
  notes?: string[];
}

export const emptyRequirements = (): TaskRequirements => ({
  skills: [],
  items: [],
  quests: [],
  unlocks: [],
  completedTaskIds: [],
});
