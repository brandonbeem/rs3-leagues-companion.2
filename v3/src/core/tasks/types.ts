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

export type TaskTier = 'easy' | 'medium' | 'hard' | 'elite' | 'master';
export type VerificationStatus = 'verified' | 'needs-review';

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

export interface AcquisitionStep {
  type: 'obtain-item' | 'train-skill' | 'travel' | 'complete-quest' | 'perform-action';
  label: string;
  locationId?: LocationId;
  itemId?: ItemId;
  quantity?: number;
  notes?: string;
}

export interface TaskDefinition {
  id: TaskId;
  name: string;
  description: string;
  category: TaskCategory;
  tier: TaskTier;
  points: number;
  locality: string;
  regionId: RegionId;
  locationId: LocationId | null;
  requirements: TaskRequirements;
  recommendedItemIds: ItemId[];
  acquisitionSteps: AcquisitionStep[];
  nearbyTaskIds: TaskId[];
  estimatedSeconds: number | null;
  routePolicy: 'normal' | 'requires-item-owned' | 'manual-only' | 'blocked-review';
  reviewStatus: VerificationStatus;
  sourceUrl?: string;
  sourceCheckedAt?: string;
  notes?: string[];
}

export interface TaskEligibility {
  available: boolean;
  missingSkills: SkillRequirement[];
  missingItems: ItemRequirement[];
  missingQuests: string[];
  missingUnlocks: string[];
  missingTasks: TaskId[];
  blockedByReview: boolean;
}

export const emptyRequirements = (): TaskRequirements => ({
  skills: [],
  items: [],
  quests: [],
  unlocks: [],
  completedTaskIds: [],
});
