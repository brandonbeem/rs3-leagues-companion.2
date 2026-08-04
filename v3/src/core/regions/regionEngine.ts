import type { LocationId, RegionId } from '../ids';
import type { PlayerState } from '../player/types';
import type { RegionDefinition } from './types';
import type { WorldLocation } from '../world/types';

export function isRegionUnlocked(player: PlayerState, regionId: RegionId): boolean {
  return player.regionUnlocks[regionId]?.unlocked ?? false;
}

export function getUnlockedRegions(
  player: PlayerState,
  regions: RegionDefinition[],
): RegionDefinition[] {
  return regions.filter((region) => region.starter || isRegionUnlocked(player, region.id));
}

export function getAccessibleLocations(
  player: PlayerState,
  locations: WorldLocation[],
): WorldLocation[] {
  return locations.filter((location) => isRegionUnlocked(player, location.regionId));
}

export function canAccessLocation(
  player: PlayerState,
  locations: WorldLocation[],
  locationId: LocationId,
): boolean {
  const location = locations.find((item) => item.id === locationId);
  return Boolean(location && isRegionUnlocked(player, location.regionId));
}

export function normalizeStarterRegions(
  player: PlayerState,
  regions: RegionDefinition[],
): PlayerState {
  const regionUnlocks = { ...player.regionUnlocks };
  regions.forEach((region) => {
    if (region.starter) {
      regionUnlocks[region.id] = {
        unlocked: true,
        unlockedAtPoints: regionUnlocks[region.id]?.unlockedAtPoints ?? 0,
      };
    }
  });
  return { ...player, regionUnlocks };
}
