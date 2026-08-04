import type { ItemId, LocationId, RegionId, TaskId, TeleportId } from '../ids';

export type SkillName =
  | 'Attack'
  | 'Strength'
  | 'Defence'
  | 'Constitution'
  | 'Ranged'
  | 'Prayer'
  | 'Magic'
  | 'Cooking'
  | 'Woodcutting'
  | 'Fletching'
  | 'Fishing'
  | 'Firemaking'
  | 'Crafting'
  | 'Smithing'
  | 'Mining'
  | 'Herblore'
  | 'Agility'
  | 'Thieving'
  | 'Slayer'
  | 'Farming'
  | 'Runecrafting'
  | 'Hunter'
  | 'Construction'
  | 'Summoning'
  | 'Dungeoneering'
  | 'Divination'
  | 'Invention'
  | 'Archaeology'
  | 'Necromancy';

export interface RegionUnlockState {
  unlocked: boolean;
  unlockedAtPoints: number | null;
}

export interface PlayerPreferences {
  avoidClueTasks: boolean;
  hideBlockedTasks: boolean;
  preferLowTravel: boolean;
  routeLength: number;
}

export interface PlayerState {
  schemaVersion: 1;
  skills: Partial<Record<SkillName, number>>;
  regionUnlocks: Record<RegionId, RegionUnlockState>;
  selectedRelicIds: string[];
  completedTaskIds: TaskId[];
  currentLocationId: LocationId | null;
  inventory: Partial<Record<ItemId, number>>;
  unlockedTeleportIds: TeleportId[];
  questIds: string[];
  unlockIds: string[];
  preferences: PlayerPreferences;
}

export type PlayerAction =
  | { type: 'set-skill'; skill: SkillName; level: number }
  | { type: 'set-region'; regionId: RegionId; unlocked: boolean; points?: number | null }
  | { type: 'toggle-relic'; relicId: string }
  | { type: 'toggle-task'; taskId: TaskId }
  | { type: 'set-location'; locationId: LocationId | null }
  | { type: 'set-preference'; key: keyof PlayerPreferences; value: PlayerPreferences[keyof PlayerPreferences] }
  | { type: 'reset-player' };
