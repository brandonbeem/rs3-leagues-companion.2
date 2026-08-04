import type { ItemId, TaskId } from '../ids';
import type { SkillName } from '../player/types';

export type DependencyKind =
  | 'task'
  | 'skill'
  | 'item'
  | 'quest'
  | 'unlock'
  | 'action'
  | 'review'
  | 'cycle';

export type DependencyStatus =
  | 'satisfied'
  | 'actionable'
  | 'unresolved'
  | 'manual'
  | 'blocked'
  | 'review';

export interface DependencyNode {
  id: string;
  kind: DependencyKind;
  label: string;
  status: DependencyStatus;
  required: boolean;
  description?: string;
  taskId?: TaskId;
  itemId?: ItemId;
  skill?: SkillName;
  currentValue?: number;
  targetValue?: number;
  quantity?: number;
  children: DependencyNode[];
}

export interface DependencySummary {
  total: number;
  satisfied: number;
  actionable: number;
  unresolved: number;
  manual: number;
  blocked: number;
  review: number;
}

export interface DependencyResolution {
  root: DependencyNode;
  summary: DependencySummary;
  canAutoResolve: boolean;
  hasCycle: boolean;
  manualReasons: string[];
  unresolvedReasons: string[];
}
