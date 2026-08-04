import type { RegionDefinition } from '../core/regions/types';
import { MISHTHALIN_ID, misthalinTownIds } from './world/misthalin';

export const regions: RegionDefinition[] = [
  {
    id: MISHTHALIN_ID,
    name: 'Misthalin',
    description: 'Starter region and first detailed world-graph migration.',
    starter: true,
    townIds: Object.values(misthalinTownIds),
    status: 'active',
    reviewStatus: 'needs-review',
  },
];

export const regionById = new Map(regions.map((region) => [region.id, region]));
