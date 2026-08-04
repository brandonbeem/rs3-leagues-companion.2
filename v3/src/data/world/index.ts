import type { WorldDataset } from '../../core/world/types';
import { misthalinWorld } from './misthalin';

export const worldData: WorldDataset = {
  towns: [...misthalinWorld.towns],
  locations: [...misthalinWorld.locations],
  edges: [...misthalinWorld.edges],
};

export const townById = new Map(worldData.towns.map((town) => [town.id, town]));
export const locationById = new Map(worldData.locations.map((location) => [location.id, location]));

export const worldVerificationSummary = {
  verifiedTowns: worldData.towns.filter((town) => town.reviewStatus === 'verified').length,
  verifiedLocations: worldData.locations.filter((location) => location.reviewStatus === 'verified').length,
  needsReviewLocations: worldData.locations.filter((location) => location.reviewStatus === 'needs-review').length,
  provisionalEdges: worldData.edges.filter((edge) => edge.estimateStatus === 'provisional').length,
};
