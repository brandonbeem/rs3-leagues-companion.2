import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { RegionId } from '../ids';
import { normalizeStarterRegions } from '../regions/regionEngine';
import { regionById, regions } from '../../data/regions';
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

export function createDefaultPlayerState(): PlayerState {
  return {
    schemaVersion: 1,
    skills: startingSkills,
    regionUnlocks: {
      [MISHTHALIN_ID]: { unlocked: true, unlockedAtPoints: 0 },
    } as Record<RegionId, { unlocked: boolean; unlockedAtPoints: number | null }>,
    selectedRelicIds: [],
    completedTaskIds: [],
    currentLocationId: misthalinLocationIds.lumbridgeCourtyard,
    inventory: {},
    unlockedTeleportIds: [],
    questIds: [],
    unlockIds: [],
    preferences: {
      avoidClueTasks: true,
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
      return normalizeStarterRegions(
        {
          ...fallback,
          ...parsed,
          skills: { ...fallback.skills, ...parsed.skills },
          regionUnlocks: { ...fallback.regionUnlocks, ...parsed.regionUnlocks },
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
