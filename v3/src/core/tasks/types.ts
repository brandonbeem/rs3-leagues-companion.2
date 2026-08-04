import type { ItemId, LocationId, RegionId, TaskId } from '../ids';
import type { SkillName } from '../player/types';
import type { SourceReference, VerificationStatus } from '../world/types';

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
export type TaskPriority = 'Quick Win' | 'Early' | 'Mid' | 'Late' | 'Long Grind';

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
  label?: string;
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
  reviewStatus?: VerificationStatus;
  sources?: SourceReference[];
}

export interface TaskDefinition {
  id: TaskId;
  legacyTaskId: number;
  name: string;
  description: string;
  information: string;
  category: TaskCategory;
  tier: TaskTier;
  priority: TaskPriority;
  points: number;
  locality: string;
  regionId: RegionId;
  locationId: LocationId | null;
  alternateLocationIds?: LocationId[];
  requirements: TaskRequirements;
  recommendedItemIds: ItemId[];
  acquisitionSteps: AcquisitionStep[];
  nearbyTaskIds: TaskId[];
  estimatedSeconds: number | null;
  routePolicy: 'normal' | 'requires-item-owned' | 'manual-only' | 'blocked-review';
  reviewStatus: VerificationStatus;
  sources: SourceReference[];
  completionRate?: number;
  notes?: string[];
}

export interface TaskEligibility {
  status: 'completed' | 'available' | 'setup-needed' | 'blocked';
  available: boolean;
  missingSkills: SkillRequirement[];
  missingItems: ItemRequirement[];
  missingQuests: string[];
  missingUnlocks: string[];
  missingTasks: TaskId[];
  blockedByReview: boolean;
  warnings: string[];
}

export const emptyRequirements = (): TaskRequirements => ({
  skills: [],
  items: [],
  quests: [],
  unlocks: [],
  completedTaskIds: [],
});
