import type { LocationId, RegionId, TownId } from '../ids';

export type LocationKind =
  | 'city'
  | 'town'
  | 'district'
  | 'building'
  | 'resource-area'
  | 'travel-hub'
  | 'dungeon'
  | 'landmark';

export type WorldService =
  | 'bank'
  | 'shop'
  | 'range'
  | 'furnace'
  | 'anvil'
  | 'altar'
  | 'lodestone'
  | 'fishing'
  | 'mining'
  | 'woodcutting'
  | 'combat'
  | 'quest-hub';

export interface TownDefinition {
  id: TownId;
  regionId: RegionId;
  name: string;
  description: string;
  locationIds: LocationId[];
  reviewStatus: 'verified' | 'needs-review';
}

export interface WorldLocation {
  id: LocationId;
  regionId: RegionId;
  townId: TownId;
  name: string;
  kind: LocationKind;
  description: string;
  services: WorldService[];
  tags: string[];
  reviewStatus: 'verified' | 'needs-review';
}

export type TravelMode = 'walk' | 'lodestone' | 'teleport' | 'boat' | 'shortcut';

export interface TravelRequirement {
  type: 'skill' | 'quest' | 'item' | 'region' | 'unlock';
  key: string;
  level?: number;
}

export interface TravelEdge {
  from: LocationId;
  to: LocationId;
  seconds: number;
  mode: TravelMode;
  bidirectional: boolean;
  requirements: TravelRequirement[];
  estimateStatus: 'verified' | 'provisional';
  notes?: string;
}

export interface WorldDataset {
  towns: TownDefinition[];
  locations: WorldLocation[];
  edges: TravelEdge[];
}
