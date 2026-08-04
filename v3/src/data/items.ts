import { ids } from '../core/ids';
import type { ItemId } from '../core/ids';

export type ItemKind = 'tool' | 'consumable' | 'quest-item' | 'equipment' | 'material';

export interface ItemDefinition {
  id: ItemId;
  name: string;
  kind: ItemKind;
  persistent: boolean;
  starterKitEligible: boolean;
  toolBeltEligible?: boolean;
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
    persistent: true,
    starterKitEligible: true,
    notes: 'Reusable fishing tool. Exact Catalyst League starting access is still being verified.',
  },
  {
    id: itemIds.pickaxe,
    name: 'Usable pickaxe',
    kind: 'tool',
    persistent: true,
    starterKitEligible: true,
    toolBeltEligible: true,
    notes: 'Reusable mining tool. The player may carry one or have an eligible pickaxe available through the tool belt.',
  },
  {
    id: itemIds.charmedSack,
    name: 'Charmed sack',
    kind: 'quest-item',
    persistent: false,
    starterKitEligible: false,
    notes: 'Used at the Nexus in Lumbridge Swamp and kept outside automatic starter-kit planning.',
  },
];

export const itemById = new Map(items.map((item) => [item.id, item]));
