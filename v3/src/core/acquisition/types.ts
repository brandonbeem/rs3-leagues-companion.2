import type { ItemId, LocationId, TaskId } from '../ids';
import type { VerificationStatus } from '../world/types';

export type AcquisitionMethod =
  | 'bank'
  | 'tool-belt'
  | 'starter'
  | 'shop'
  | 'gather'
  | 'craft'
  | 'manual';

export interface AcquisitionOptionDefinition {
  id: string;
  itemId: ItemId;
  label: string;
  method: AcquisitionMethod;
  estimatedSeconds: number | null;
  coinCost: number | null;
  locationId?: LocationId;
  reusable: boolean;
  automatic: boolean;
  reviewStatus: VerificationStatus;
  notes?: string[];
}

export type AcquisitionCandidateStatus = 'available' | 'manual' | 'review';

export interface AcquisitionCandidate extends AcquisitionOptionDefinition {
  status: AcquisitionCandidateStatus;
  score: number;
  generated?: boolean;
}

export interface ItemAcquisitionResolution {
  itemId: ItemId;
  quantity: number;
  inventoryQuantity: number;
  bankQuantity: number;
  persistentOwned: boolean;
  satisfied: boolean;
  bestOption: AcquisitionCandidate | null;
  alternatives: AcquisitionCandidate[];
}

export interface ResourceOpportunity {
  itemId: ItemId;
  itemName: string;
  opportunityTaskIds: TaskId[];
  opportunityCount: number;
  score: number;
  bestOption: AcquisitionCandidate | null;
}
