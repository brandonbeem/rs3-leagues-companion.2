import { ids } from '../core/ids';
import type { ItemId } from '../core/ids';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  kind: 'tool' | 'consumable' | 'quest-item' | 'equipment';
  notes?: string;
}

export const itemIds = {
  smallFishingNet: ids.item('small-fishing-net'),
  pickaxe: ids.item('usable-pickaxe'),
  charmedSack: ids.item('charmed-sack'),
} as const;

export const items: ItemDefinition[] = [
  {
    id: itemIds.smallFishingNet,
    name: 'Small fishing net',
    kind: 'tool',
    notes: 'Required to use the net option at novice fishing spots unless League starting conditions supply an equivalent tool.',
  },
  {
    id: itemIds.pickaxe,
    name: 'Usable pickaxe',
    kind: 'tool',
    notes: 'May be carried or available through the tool belt; ownership handling will be expanded in the acquisition engine.',
  },
  {
    id: itemIds.charmedSack,
    name: 'Charmed sack',
    kind: 'quest-item',
    notes: 'Used at the Nexus in Lumbridge Swamp.',
  },
];

export const itemById = new Map(items.map((item) => [item.id, item]));
