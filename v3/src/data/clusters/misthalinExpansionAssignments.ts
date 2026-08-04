import type { ClusterId, TaskId } from '../../core/ids';
import { misthalinClusterIds } from './misthalin';
import { misthalinExpansionTaskIds } from '../tasks/misthalinExpansion';

export const misthalinExpansionAssignments: Partial<Record<ClusterId, TaskId[]>> = {
  [misthalinClusterIds.lumbridgeCastle]: [
    misthalinExpansionTaskIds.smeltSteel,
    misthalinExpansionTaskIds.willowLumbridge,
  ],
  [misthalinClusterIds.lumbridgeSwamp]: [
    misthalinExpansionTaskIds.cookRatMeat,
    misthalinExpansionTaskIds.craftWaterRune,
    misthalinExpansionTaskIds.waterRunes50,
  ],
  [misthalinClusterIds.lumbridgeCowField]: [
    misthalinExpansionTaskIds.milkCow,
  ],
  [misthalinClusterIds.draynorVillage]: [
    misthalinExpansionTaskIds.nedRope,
  ],
  [misthalinClusterIds.wizardsTower]: [
    misthalinExpansionTaskIds.fireEssling,
  ],
  [misthalinClusterIds.varrockSouth]: [
    misthalinExpansionTaskIds.earthAltar,
  ],
  [misthalinClusterIds.varrockCentral]: [
    misthalinExpansionTaskIds.elsieStory,
    misthalinExpansionTaskIds.strayDog,
    misthalinExpansionTaskIds.pureEssence50,
    misthalinExpansionTaskIds.varrockGuard,
    misthalinExpansionTaskIds.brightMemories50,
  ],
};
