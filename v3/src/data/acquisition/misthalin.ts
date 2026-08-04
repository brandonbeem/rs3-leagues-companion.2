import type { AcquisitionOptionDefinition } from '../../core/acquisition/types';
import { itemIds } from '../items';
import { misthalinLocationIds } from '../world/misthalin';
import { misthalinTaskLocationIds } from '../world/misthalinTaskLocations';

export const misthalinAcquisitionOptions: AcquisitionOptionDefinition[] = [
  {
    id: 'acquire-small-net-starter-route',
    itemId: itemIds.smallFishingNet,
    label: 'Confirm or collect a small fishing net on the Lumbridge Swamp starter route',
    method: 'starter',
    estimatedSeconds: 30,
    coinCost: 0,
    locationId: misthalinTaskLocationIds.lumbridgeSwampFishing,
    reusable: true,
    automatic: true,
    reviewStatus: 'needs-review',
    notes: [
      'The reusable resource relationship is valid, but exact Catalyst starting access still needs confirmation.',
      'Until verified, this path is shown as a review item rather than silently treated as guaranteed.',
    ],
  },
  {
    id: 'acquire-pickaxe-starter-route',
    itemId: itemIds.pickaxe,
    label: 'Confirm a usable pickaxe or tool-belt pickaxe during the Lumbridge starter route',
    method: 'tool-belt',
    estimatedSeconds: 30,
    coinCost: 0,
    locationId: misthalinLocationIds.lumbridgeCourtyard,
    reusable: true,
    automatic: true,
    reviewStatus: 'needs-review',
    notes: [
      'The engine tracks the pickaxe as a reusable asset once the player confirms access.',
      'The exact League starting source and tool-belt state remain under review.',
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
