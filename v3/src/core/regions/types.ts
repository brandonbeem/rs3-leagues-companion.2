import type { RegionId, TownId } from '../ids';

export interface RegionDefinition {
  id: RegionId;
  name: string;
  description: string;
  starter: boolean;
  townIds: TownId[];
  status: 'active' | 'migration-pending';
  reviewStatus: 'verified' | 'needs-review';
}
