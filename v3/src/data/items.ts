import { ids } from '../core/ids';
import type { ItemId } from '../core/ids';

export type ItemKind = 'tool' | 'consumable' | 'quest-item' | 'equipment' | 'material';
export type ItemAvailability =
  | 'starting-tool-belt'
  | 'tool-belt-addable'
  | 'inventory-or-bank'
  | 'consumable'
  | 'manual';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  kind: ItemKind;
  availability: ItemAvailability;
  persistent: boolean;
  starterKitEligible: boolean;
  toolBeltEligible: boolean;
  notes?: string;
}

export const itemIds = {
  smallFishingNet: ids.item('small-fishing-net'),
  fishingRod: ids.item('fishing-rod'),
  flyFishingRod: ids.item('fly-fishing-rod'),
  harpoon: ids.item('harpoon'),
  lobsterPot: ids.item('lobster-pot'),
  pickaxe: ids.item('usable-pickaxe'),
  charmedSack: ids.item('charmed-sack'),
} as const;

export const items: ItemDefinition[] = [
  {
    id: itemIds.smallFishingNet,
    name: 'Small fishing net',
    kind: 'tool',
    availability: 'tool-belt-addable',
    persistent: true,
    starterKitEligible: true,
    toolBeltEligible: true,
    notes: 'Reusable Fishing tool that can be stored permanently on the RS3 tool belt.',
  },
  {
    id: itemIds.fishingRod,
    name: 'Fishing rod',
    kind: 'tool',
    availability: 'tool-belt-addable',
    persistent: true,
    starterKitEligible: false,
    toolBeltEligible: true,
    notes: 'Reusable Fishing tool that can be stored permanently on the RS3 tool belt. Fishing bait remains a consumable.',
  },
  {
    id: itemIds.flyFishingRod,
    name: 'Fly fishing rod',
    kind: 'tool',
    availability: 'tool-belt-addable',
    persistent: true,
    starterKitEligible: false,
    toolBeltEligible: true,
    notes: 'Reusable Fishing tool that can be stored permanently on the RS3 tool belt. Feathers remain consumable.',
  },
  {
    id: itemIds.harpoon,
    name: 'Harpoon',
    kind: 'tool',
    availability: 'tool-belt-addable',
    persistent: true,
    starterKitEligible: false,
    toolBeltEligible: true,
    notes: 'Reusable Fishing tool that can be stored permanently on the RS3 tool belt.',
  },
  {
    id: itemIds.lobsterPot,
    name: 'Lobster pot',
    kind: 'tool',
    availability: 'tool-belt-addable',
    persistent: true,
    starterKitEligible: false,
    toolBeltEligible: true,
    notes: 'Reusable Fishing tool that can be stored permanently on the RS3 tool belt.',
  },
  {
    id: itemIds.pickaxe,
    name: 'Usable pickaxe',
    kind: 'tool',
    availability: 'starting-tool-belt',
    persistent: true,
    starterKitEligible: false,
    toolBeltEligible: true,
    notes: 'All players have a usable pickaxe available through the RS3 tool belt by default; upgraded pickaxes can replace it later.',
  },
  {
    id: itemIds.charmedSack,
    name: 'Charmed sack',
    kind: 'quest-item',
    availability: 'manual',
    persistent: false,
    starterKitEligible: false,
    toolBeltEligible: false,
    notes: 'Used at the Nexus in Lumbridge Swamp and kept outside automatic starter-kit planning.',
  },
];

export const itemById = new Map(items.map((item) => [item.id, item]));
export const startingToolBeltItemIds = items
  .filter((item) => item.availability === 'starting-tool-belt')
  .map((item) => item.id);
export const toolBeltEligibleItems = items.filter((item) => item.toolBeltEligible);
export const toolBeltEligibleItemIdSet = new Set(toolBeltEligibleItems.map((item) => item.id));
