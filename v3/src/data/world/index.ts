import type { WorldDataset } from '../../core/world/types';
import { misthalinWorld } from './misthalin';
import { misthalinTaskLocationWorld } from './misthalinTaskLocations';
import { misthalinExtendedLocationWorld } from './misthalinExtendedLocations';

export const worldData: WorldDataset = {
  towns: [
    ...misthalinWorld.towns,
    ...misthalinTaskLocationWorld.towns,
    ...misthalinExtendedLocationWorld.towns,
  ],
  locations: [
    ...misthalinWorld.locations,
    ...misthalinTaskLocationWorld.locations,
    ...misthalinExtendedLocationWorld.locations,
  ],
  edges: [
    ...misthalinWorld.edges,
    ...misthalinTaskLocationWorld.edges,
    ...misthalinExtendedLocationWorld.edges,
  ],
};

export const townById = new Map(worldData.towns.map((town) => [town.id, town]));
export const locationById = new Map(worldData.locations.map((location) => [location.id, location]));

export const worldVerificationSummary = {
  verifiedTowns: worldData.towns.filter((town) => town.reviewStatus === 'verified').length,
  verifiedLocations: worldData.locations.filter((location) => location.reviewStatus === 'verified').length,
  needsReviewLocations: worldData.locations.filter((location) => location.reviewStatus === 'needs-review').length,
  provisionalEdges: worldData.edges.filter((edge) => edge.estimateStatus === 'provisional').length,
};
