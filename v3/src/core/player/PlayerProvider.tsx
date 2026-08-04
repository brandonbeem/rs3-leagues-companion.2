import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { ItemId, RegionId } from '../ids';
import { normalizeStarterRegions } from '../regions/regionEngine';
import { regionById, regions } from '../../data/regions';
import {
  startingToolBeltItemIds,
  toolBeltEligibleItemIdSet,
} from '../../data/items';
import { MISHTHALIN_ID, misthalinLocationIds } from '../../data/world/misthalin';
import type { PlayerAction, PlayerPreferences, PlayerState, SkillName } from './types';

const STORAGE_KEY = 'rs3-v3-player-state';
const LEGACY_RELIC_KEY = 'rs3-v3-selected-relics';

const startingSkills: Partial<Record<SkillName, number>> = {
  Attack: 1,
  Strength: 1,
  Defence: 1,
  Constitution: 10,
  Ranged: 1,
  Prayer: 1,
  Magic: 1,
  Cooking: 1,
  Woodcutting: 1,
  Fletching: 1,
  Fishing: 1,
  Firemaking: 1,
  Crafting: 1,
  Smithing: 1,
  Mining: 1,
  Herblore: 1,
  Agility: 1,
  Thieving: 1,
  Slayer: 1,
  Farming: 1,
  Runecrafting: 1,
  Hunter: 1,
  Construction: 1,
  Summoning: 1,
  Dungeoneering: 1,
  Divination: 1,
  Invention: 1,
  Archaeology: 1,
  Necromancy: 1,
};

function uniqueItemIds(itemIds: ItemId[]): ItemId[] {
  return Array.from(new Set(itemIds));
}

export function createDefaultPlayerState(): PlayerState {
  return {
    schemaVersion: 3,
    skills: startingSkills,
    regionUnlocks: {
      [MISHTHALIN_ID]: { unlocked: true, unlockedAtPoints: 0 },
    } as Record<RegionId, { unlocked: boolean; unlockedAtPoints: number | null }>,
    selectedRelicIds: [],
    completedTaskIds: [],
    currentLocationId: misthalinLocationIds.lumbridgeCourtyard,
    inventory: {},
    bankInventory: {},
    toolBeltItemIds: [...startingToolBeltItemIds],
    ownedAssetIds: [],
    unlockedTeleportIds: [],
    questIds: [],
    unlockIds: [],
    preferences: {
      avoidClueTasks: true,
      avoidQuestTasks: true,
      hideBlockedTasks: true,
      preferLowTravel: true,
      routeLength: 25,
    },
  };
}

function loadPlayerState(): PlayerState {
  const fallback = createDefaultPlayerState();

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PlayerState>;
      const legacyOwnedAssets = parsed.ownedAssetIds ?? [];
      const legacyToolBeltItems = legacyOwnedAssets.filter((itemId) => toolBeltEligibleItemIdSet.has(itemId));
      const nonToolAssets = legacyOwnedAssets.filter((itemId) => !toolBeltEligibleItemIdSet.has(itemId));
      const savedToolBeltItems = parsed.toolBeltItemIds ?? legacyToolBeltItems;

      return normalizeStarterRegions(
        {
          ...fallback,
          ...parsed,
          schemaVersion: 3,
          skills: { ...fallback.skills, ...parsed.skills },
          regionUnlocks: { ...fallback.regionUnlocks, ...parsed.regionUnlocks },
          inventory: { ...fallback.inventory, ...parsed.inventory },
          bankInventory: { ...fallback.bankInventory, ...parsed.bankInventory },
          toolBeltItemIds: uniqueItemIds([
            ...startingToolBeltItemIds,
            ...savedToolBeltItems,
          ]),
          ownedAssetIds: nonToolAssets,
          preferences: { ...fallback.preferences, ...parsed.preferences },
        },
        regions,
      );
    }

    const legacyRelics = window.localStorage.getItem(LEGACY_RELIC_KEY);
    if (legacyRelics) {
      const selectedRelicIds = JSON.parse(legacyRelics) as string[];
      return { ...fallback, selectedRelicIds };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function setQuantity(
  collection: Partial<Record<ItemId, number>>,
  itemId: ItemId,
  quantity: number,
): Partial<Record<ItemId, number>> {
  const next = { ...collection };
  const normalized = Math.max(0, Math.floor(quantity));
  if (normalized === 0) delete next[itemId];
  else next[itemId] = normalized;
  return next;
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'set-skill':
      return {
        ...state,
        skills: {
          ...state.skills,
          [action.skill]: Math.max(1, Math.min(120, Math.round(action.level))),
        },
      };

    case 'set-region': {
      const region = regionById.get(action.regionId);
      if (region?.starter && !action.unlocked) return state;
      return {
        ...state,
        regionUnlocks: {
          ...state.regionUnlocks,
          [action.regionId]: {
            unlocked: action.unlocked,
            unlockedAtPoints: action.unlocked
              ? action.points ?? state.regionUnlocks[action.regionId]?.unlockedAtPoints ?? null
              : null,
          },
        },
      };
    }

    case 'toggle-relic':
      return {
        ...state,
        selectedRelicIds: state.selectedRelicIds.includes(action.relicId)
          ? state.selectedRelicIds.filter((id) => id !== action.relicId)
          : [...state.selectedRelicIds, action.relicId],
      };

    case 'toggle-task':
      return {
        ...state,
        completedTaskIds: state.completedTaskIds.includes(action.taskId)
          ? state.completedTaskIds.filter((id) => id !== action.taskId)
          : [...state.completedTaskIds, action.taskId],
      };

    case 'set-location':
      return { ...state, currentLocationId: action.locationId };

    case 'set-item-quantity':
      return action.storage === 'inventory'
        ? { ...state, inventory: setQuantity(state.inventory, action.itemId, action.quantity) }
        : { ...state, bankInventory: setQuantity(state.bankInventory, action.itemId, action.quantity) };

    case 'set-tool-belt-item': {
      if (!toolBeltEligibleItemIdSet.has(action.itemId)) return state;
      if (!action.added && startingToolBeltItemIds.includes(action.itemId)) return state;
      return {
        ...state,
        toolBeltItemIds: action.added
          ? state.toolBeltItemIds.includes(action.itemId)
            ? state.toolBeltItemIds
            : [...state.toolBeltItemIds, action.itemId]
          : state.toolBeltItemIds.filter((itemId) => itemId !== action.itemId),
      };
    }

    case 'set-asset-owned':
      return {
        ...state,
        ownedAssetIds: action.owned
          ? state.ownedAssetIds.includes(action.itemId)
            ? state.ownedAssetIds
            : [...state.ownedAssetIds, action.itemId]
          : state.ownedAssetIds.filter((itemId) => itemId !== action.itemId),
      };

    case 'set-preference':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.key]: action.value,
        } as PlayerPreferences,
      };

    case 'reset-player':
      return createDefaultPlayerState();

    default:
      return state;
  }
}

interface PlayerContextValue {
  player: PlayerState;
  dispatch: Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, dispatch] = useReducer(playerReducer, undefined, loadPlayerState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  }, [player]);

  const value = useMemo(() => ({ player, dispatch }), [player]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used inside PlayerProvider.');
  }
  return context;
}
