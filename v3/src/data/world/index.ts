import type { WorldDataset } from '../../core/world/types';
import { misthalinWorld } from './misthalin';

export const worldData: WorldDataset = {
  towns: [...misthalinWorld.towns],
  locations: [...misthalinWorld.locations],
  edges: [...misthalinWorld.edges],
};

export const townById = new Map(worldData.towns.map((town) => [town.id, town]));
export const locationById = new Map(worldData.locations.map((location) => [location.id, location]));
