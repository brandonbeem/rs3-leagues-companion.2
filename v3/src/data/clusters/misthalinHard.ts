import { ids } from '../../core/ids';
import type { TaskClusterDefinition } from '../../core/clusters/types';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinExtendedLocationIds } from '../world/misthalinExtendedLocations';

const hardTaskId = (slug: string) => ids.task(`catalyst-misthalin-hard-${slug}`);

export const misthalinHardClusterIds = {
  runespanProgression: ids.cluster('misthalin-hard-runespan-progression'),
  edgevilleProgression: ids.cluster('misthalin-hard-edgeville-progression'),
  fortForinthryProgression: ids.cluster('misthalin-hard-fort-forinthry-progression'),
  lumbridgeLongTerm: ids.cluster('misthalin-hard-lumbridge-long-term'),
  cityOfUmProgression: ids.cluster('misthalin-hard-city-of-um-progression'),
  varrockEndgame: ids.cluster('misthalin-hard-varrock-endgame'),
} as const;

const runespanTasks = [
  hardTaskId('death-esswraith'),
  hardTaskId('massive-pouch'),
  hardTaskId('master-runecrafter-outfit'),
];

const edgevilleTasks = [
  hardTaskId('hard-varrock-achievements'),
  hardTaskId('waka-canoe-edgeville'),
  hardTaskId('edgeville-elder-tree'),
];

const fortTasks = [hardTaskId('fort-workshop-tier-3')];

const lumbridgeTasks = [
  hardTaskId('enter-zanaris'),
  hardTaskId('hard-lumbridge-achievements'),
  hardTaskId('unlock-bladed-dive'),
  hardTaskId('mithril-platebody-draynor-sewers'),
  hardTaskId('grow-magic-tree-lumbridge'),
];

const cityOfUmTasks = [
  hardTaskId('defeat-hermod'),
  hardTaskId('defeat-hermod-100'),
  hardTaskId('dead-beats'),
  hardTaskId('smelt-necronium-um'),
  hardTaskId('passing-bracelet'),
  hardTaskId('ghostly-impling'),
  hardTaskId('death-skull-tier-70'),
  hardTaskId('powerful-communion'),
  hardTaskId('conjure-undead-army'),
  hardTaskId('defeat-nakatra'),
  hardTaskId('gate-of-elidinis'),
  hardTaskId('hard-underworld-achievements'),
];

const varrockTasks = [
  hardTaskId('family-crest-gauntlets'),
  hardTaskId('romily-wild-pie'),
  hardTaskId('three-archaeology-relics'),
  hardTaskId('dark-animica-50'),
  hardTaskId('defeat-kerapac'),
  hardTaskId('defeat-arch-glacor'),
];

export const misthalinHardTaskClusters: TaskClusterDefinition[] = [
  {
    id: misthalinHardClusterIds.runespanProgression,
    name: 'Hard Runespan Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.wizardsTower,
    taskIds: runespanTasks,
    serviceTags: ['runecrafting'],
    activityTags: ['skilling', 'collection'],
    sharedItemIds: [],
    recommendedTaskOrder: runespanTasks,
    estimatedInternalTravelSeconds: 90,
    description: 'High-level Runespan siphoning and long-term reward goals reached through Wizards’ Tower.',
    reviewStatus: 'verified',
    notes: ['Only the death esswraith task is intended for normal route scoring; outfit and pouch goals remain manual.'],
  },
  {
    id: misthalinHardClusterIds.edgevilleProgression,
    name: 'Hard Edgeville Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.edgevilleLodestone,
    taskIds: edgevilleTasks,
    serviceTags: ['bank', 'lodestone', 'canoe', 'combat-area'],
    activityTags: ['skilling', 'other'],
    sharedItemIds: [],
    recommendedTaskOrder: [hardTaskId('waka-canoe-edgeville'), hardTaskId('edgeville-elder-tree'), hardTaskId('hard-varrock-achievements')],
    estimatedInternalTravelSeconds: 95,
    description: 'Edgeville canoe, elder-tree, and Hard Varrock achievement progression.',
    reviewStatus: 'needs-review',
    notes: ['The elder-tree location still needs a dedicated graph node.'],
  },
  {
    id: misthalinHardClusterIds.fortForinthryProgression,
    name: 'Fort Forinthry Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinExtendedLocationIds.fortForinthry,
    taskIds: fortTasks,
    serviceTags: ['bank', 'anvil', 'shop'],
    activityTags: ['skilling'],
    sharedItemIds: [],
    recommendedTaskOrder: fortTasks,
    estimatedInternalTravelSeconds: 45,
    description: 'Long-term Fort Forinthry workshop construction and unlock progression.',
    reviewStatus: 'verified',
    notes: ['Quest and construction requirements keep this cluster out of automatic routes until satisfied.'],
  },
  {
    id: misthalinHardClusterIds.lumbridgeLongTerm,
    name: 'Hard Lumbridge Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.lumbridgeCourtyard,
    taskIds: lumbridgeTasks,
    serviceTags: ['bank', 'lodestone', 'range', 'quest-hub'],
    activityTags: ['exploration', 'skilling', 'combat', 'other'],
    sharedItemIds: [],
    recommendedTaskOrder: lumbridgeTasks,
    estimatedInternalTravelSeconds: 210,
    description: 'Quest-gated, farming, smithing, achievement, and Shattered Worlds goals around greater Lumbridge.',
    reviewStatus: 'needs-review',
    notes: ['Draynor Sewers and the Lumbridge tree patch need dedicated route nodes before distance scoring is final.'],
  },
  {
    id: misthalinHardClusterIds.cityOfUmProgression,
    name: 'Hard City of Um Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinExtendedLocationIds.cityOfUm,
    taskIds: cityOfUmTasks,
    serviceTags: ['bank', 'shop', 'combat-area'],
    activityTags: ['bossing', 'combat', 'skilling', 'collection', 'exploration', 'other'],
    sharedItemIds: [],
    recommendedTaskOrder: [
      hardTaskId('powerful-communion'),
      hardTaskId('smelt-necronium-um'),
      hardTaskId('passing-bracelet'),
      hardTaskId('death-skull-tier-70'),
      hardTaskId('defeat-hermod'),
      hardTaskId('defeat-hermod-100'),
      hardTaskId('conjure-undead-army'),
      hardTaskId('defeat-nakatra'),
      hardTaskId('gate-of-elidinis'),
      hardTaskId('dead-beats'),
      hardTaskId('ghostly-impling'),
      hardTaskId('hard-underworld-achievements'),
    ],
    estimatedInternalTravelSeconds: 180,
    description: 'Necromancy rituals, equipment upgrades, achievements, and City of Um boss progression.',
    reviewStatus: 'needs-review',
    notes: ['Boss arenas will receive dedicated nodes before boss-route preparation is enabled.'],
  },
  {
    id: misthalinHardClusterIds.varrockEndgame,
    name: 'Hard Varrock & Endgame Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.archaeologyCampus,
    taskIds: varrockTasks,
    serviceTags: ['bank', 'archaeology', 'quest-hub'],
    activityTags: ['collection', 'skilling', 'bossing'],
    sharedItemIds: [],
    recommendedTaskOrder: [
      hardTaskId('three-archaeology-relics'),
      hardTaskId('dark-animica-50'),
      hardTaskId('romily-wild-pie'),
      hardTaskId('family-crest-gauntlets'),
      hardTaskId('defeat-kerapac'),
      hardTaskId('defeat-arch-glacor'),
    ],
    estimatedInternalTravelSeconds: 240,
    description: 'Varrock collection goals, Archaeology progression, Empty Throne Room mining, and nearby endgame bosses.',
    reviewStatus: 'needs-review',
    notes: ['Empty Throne Room, Kerapac, and Arch-Glacor need dedicated graph nodes before final route scoring.'],
  },
];
