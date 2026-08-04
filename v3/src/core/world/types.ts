import type { LocationId, RegionId, TownId } from '../ids';

export type VerificationStatus = 'verified' | 'needs-review' | 'placeholder';

export interface SourceReference {
  title: string;
  wikiPath: string;
  note?: string;
  checkedAt?: string;
}

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
  | 'bank-deposit'
  | 'shop'
  | 'grand-exchange'
  | 'range'
  | 'furnace'
  | 'forge'
  | 'anvil'
  | 'spinning-wheel'
  | 'altar'
  | 'water-source'
  | 'lodestone'
  | 'canoe'
  | 'fishing'
  | 'mining'
  | 'woodcutting'
  | 'combat'
  | 'quest-hub'
  | 'archaeology'
  | 'runecrafting'
  | 'thieving'
  | 'agility';

export interface TownDefinition {
  id: TownId;
  regionId: RegionId;
  name: string;
  description: string;
  locationIds: LocationId[];
  reviewStatus: VerificationStatus;
  sources?: SourceReference[];
}

export interface WorldLocation {
  id: LocationId;
  regionId: RegionId;
  townId: TownId;
  name: string;
  kind: LocationKind;
  description: string;
  services: WorldService[];
  serviceRequirements?: Partial<Record<WorldService, TravelRequirement[]>>;
  tags: string[];
  reviewStatus: VerificationStatus;
  sources?: SourceReference[];
  accessNotes?: string[];
}

export type TravelMode = 'walk' | 'lodestone' | 'teleport' | 'boat' | 'canoe' | 'shortcut';

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
  estimateStatus: 'verified' | 'measured' | 'provisional';
  notes?: string;
  sources?: SourceReference[];
}

export interface WorldDataset {
  towns: TownDefinition[];
  locations: WorldLocation[];
  edges: TravelEdge[];
}
