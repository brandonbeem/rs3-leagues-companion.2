import type { ItemId } from '../ids';
import type { PlayerState } from '../player/types';
import { itemById } from '../../data/items';

export interface ItemAccessResult {
  satisfied: boolean;
  source: 'starting-tool-belt' | 'tool-belt' | 'inventory' | 'owned-asset' | 'missing';
  carriedQuantity: number;
  bankQuantity: number;
}

export function resolveItemAccess(
  player: PlayerState,
  itemId: ItemId,
  quantity = 1,
): ItemAccessResult {
  const item = itemById.get(itemId);
  const carriedQuantity = player.inventory[itemId] ?? 0;
  const bankQuantity = player.bankInventory[itemId] ?? 0;

  if (item?.availability === 'starting-tool-belt') {
    return {
      satisfied: true,
      source: 'starting-tool-belt',
      carriedQuantity,
      bankQuantity,
    };
  }

  if (item?.toolBeltEligible && player.toolBeltItemIds.includes(itemId)) {
    return {
      satisfied: true,
      source: 'tool-belt',
      carriedQuantity,
      bankQuantity,
    };
  }

  if (item?.persistent && player.ownedAssetIds.includes(itemId)) {
    return {
      satisfied: true,
      source: 'owned-asset',
      carriedQuantity,
      bankQuantity,
    };
  }

  if (carriedQuantity >= quantity) {
    return {
      satisfied: true,
      source: 'inventory',
      carriedQuantity,
      bankQuantity,
    };
  }

  return {
    satisfied: false,
    source: 'missing',
    carriedQuantity,
    bankQuantity,
  };
}

export function hasItemAccess(player: PlayerState, itemId: ItemId, quantity = 1): boolean {
  return resolveItemAccess(player, itemId, quantity).satisfied;
}
