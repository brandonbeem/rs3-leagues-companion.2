import type { AcquisitionOptionDefinition } from '../../core/acquisition/types';
import { itemIds } from '../items';
import { misthalinLocationIds } from '../world/misthalin';
import { misthalinTaskLocationIds } from '../world/misthalinTaskLocations';

export const misthalinAcquisitionOptions: AcquisitionOptionDefinition[] = [
  {
    id: 'add-small-net-tool-belt',
    itemId: itemIds.smallFishingNet,
    label: 'Obtain a small fishing net and add it permanently to the tool belt',
    method: 'tool-belt',
    estimatedSeconds: 45,
    coinCost: 0,
    locationId: misthalinLocationIds.lumbridgeCourtyard,
    reusable: true,
    automatic: true,
    reviewStatus: 'verified',
    notes: [
      'The RS3 tool belt supports the small fishing net.',
      'Lumbridge Fishing Supplies provides an early source; exact walking seconds remain provisional.',
    ],
  },
  {
    id: 'starting-pickaxe-tool-belt',
    itemId: itemIds.pickaxe,
    label: 'Use the pickaxe already available on the starting tool belt',
    method: 'tool-belt',
    estimatedSeconds: 0,
    coinCost: 0,
    locationId: misthalinLocationIds.lumbridgeCourtyard,
    reusable: true,
    automatic: true,
    reviewStatus: 'verified',
    notes: [
      'RuneScape records the pickaxe as a default tool-belt item for all players.',
      'Upgraded pickaxes can replace the starting tool later without changing basic task eligibility.',
    ],
  },
  {
    id: 'acquire-charmed-sack-manual',
    itemId: itemIds.charmedSack,
    label: 'Obtain the charmed sack through the Nexus activity',
    method: 'manual',
    estimatedSeconds: null,
    coinCost: 0,
    locationId: misthalinTaskLocationIds.lumbridgeNexus,
    reusable: false,
    automatic: false,
    reviewStatus: 'verified',
    notes: ['This remains player-controlled side content and is not part of the automatic starter kit.'],
  },
];
