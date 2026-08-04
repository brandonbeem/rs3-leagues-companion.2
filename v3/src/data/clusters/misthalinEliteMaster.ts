import { ids } from '../../core/ids';
import type { TaskClusterDefinition } from '../../core/clusters/types';
import type { TaskTier } from '../../core/tasks/types';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinExtendedLocationIds } from '../world/misthalinExtendedLocations';

const lateTaskId = (tier: Extract<TaskTier, 'elite' | 'master'>, slug: string) =>
  ids.task(`catalyst-misthalin-${tier}-${slug}`);

export const misthalinEliteMasterClusterIds = {
  eliteRunespan: ids.cluster('misthalin-elite-runespan-progression'),
  eliteEdgeville: ids.cluster('misthalin-elite-edgeville-achievements'),
  eliteFort: ids.cluster('misthalin-elite-fort-forinthry'),
  eliteLumbridge: ids.cluster('misthalin-elite-lumbridge-goals'),
  eliteCityOfUm: ids.cluster('misthalin-elite-city-of-um'),
  eliteVarrock: ids.cluster('misthalin-elite-varrock-endgame'),
  masterCityOfUm: ids.cluster('misthalin-master-city-of-um'),
  masterVarrock: ids.cluster('misthalin-master-varrock-equipment'),
} as const;

const eliteRunespanTasks = [
  lateTaskId('elite', 'greater-conjuration-platform'),
  lateTaskId('elite', 'greater-runic-staff'),
];

const eliteEdgevilleTasks = [lateTaskId('elite', 'elite-varrock-achievements')];
const eliteFortTasks = [lateTaskId('elite', 'fort-guardhouse-tier-3')];

const eliteLumbridgeTasks = [
  lateTaskId('elite', 'tormented-demons-150'),
  lateTaskId('elite', 'equip-dragon-crossbow'),
];

const eliteCityOfUmTasks = [
  lateTaskId('elite', 'first-necromancer-equipment'),
  lateTaskId('elite', 'thalmund-blueberry-pie'),
  lateTaskId('elite', 'city-of-um-owls'),
  lateTaskId('elite', 'soul-rune-soul-cape'),
  lateTaskId('elite', 'death-skull-tier-90'),
  lateTaskId('elite', 'nakatra-100'),
  lateTaskId('elite', 'gate-of-elidinis-100'),
  lateTaskId('elite', 'elite-underworld-achievements'),
];

const eliteVarrockTasks = [
  lateTaskId('elite', 'croesus'),
  lateTaskId('elite', 'croesus-100'),
  lateTaskId('elite', 'kerapac-100'),
  lateTaskId('elite', 'arch-glacor-hard-mode-100'),
  lateTaskId('elite', 'equip-leng-weapon'),
  lateTaskId('elite', 'craft-100-earth-runes'),
  lateTaskId('elite', 'summer-pie-cooking-guild'),
  lateTaskId('elite', 'defeat-tzkal-zuk'),
  lateTaskId('elite', 'defeat-tzkal-zuk-10'),
];

const masterCityOfUmTasks = [
  lateTaskId('master', 'sanctum-combat-achievements'),
  lateTaskId('master', 'rasial-combat-achievements'),
];

const masterVarrockTasks = [
  lateTaskId('master', 'equip-ek-zekkil'),
  lateTaskId('master', 'equip-fractured-staff-of-armadyl'),
  lateTaskId('master', 'igneous-kal-zuk-cape'),
];

export const misthalinEliteMasterTaskClusters: TaskClusterDefinition[] = [
  {
    id: misthalinEliteMasterClusterIds.eliteRunespan,
    name: 'Elite Runespan Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.wizardsTower,
    taskIds: eliteRunespanTasks,
    serviceTags: ['runecrafting'],
    activityTags: ['skilling', 'collection'],
    sharedItemIds: [],
    recommendedTaskOrder: eliteRunespanTasks,
    estimatedInternalTravelSeconds: 120,
    description: 'Level-90-plus Runespan navigation and reward progression reached through Wizards’ Tower.',
    reviewStatus: 'verified',
    notes: ['The Greater Conjuration Platform task may enter normal routes when 95 Runecrafting is met; the staff remains a long-term points goal.'],
  },
  {
    id: misthalinEliteMasterClusterIds.eliteEdgeville,
    name: 'Elite Edgeville Achievements',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.edgevilleLodestone,
    taskIds: eliteEdgevilleTasks,
    serviceTags: ['bank', 'lodestone', 'quest-hub'],
    activityTags: ['other'],
    sharedItemIds: [],
    recommendedTaskOrder: eliteEdgevilleTasks,
    estimatedInternalTravelSeconds: 30,
    description: 'Elite Varrock achievement completion and reward collection through Vannaka in Edgeville.',
    reviewStatus: 'verified',
  },
  {
    id: misthalinEliteMasterClusterIds.eliteFort,
    name: 'Elite Fort Forinthry Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinExtendedLocationIds.fortForinthry,
    taskIds: eliteFortTasks,
    serviceTags: ['bank', 'anvil', 'shop'],
    activityTags: ['skilling'],
    sharedItemIds: [],
    recommendedTaskOrder: eliteFortTasks,
    estimatedInternalTravelSeconds: 45,
    description: 'Tier-3 guardhouse construction and its quest, Construction, Woodcutting, and material prerequisites.',
    reviewStatus: 'verified',
  },
  {
    id: misthalinEliteMasterClusterIds.eliteLumbridge,
    name: 'Elite Lumbridge Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.lumbridgeCourtyard,
    taskIds: eliteLumbridgeTasks,
    serviceTags: ['bank', 'lodestone', 'combat-area'],
    activityTags: ['combat', 'collection'],
    sharedItemIds: [],
    recommendedTaskOrder: eliteLumbridgeTasks,
    estimatedInternalTravelSeconds: 180,
    description: 'Tormented-demon kill progression and the dragon-crossbow equipment goal.',
    reviewStatus: 'needs-review',
    notes: ['Tormented demons need a dedicated destination before combat-route preparation can be estimated accurately.'],
  },
  {
    id: misthalinEliteMasterClusterIds.eliteCityOfUm,
    name: 'Elite City of Um Progression',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinExtendedLocationIds.cityOfUm,
    taskIds: eliteCityOfUmTasks,
    serviceTags: ['bank', 'shop', 'combat-area', 'runecrafting'],
    activityTags: ['collection', 'exploration', 'skilling', 'bossing', 'other'],
    sharedItemIds: [],
    recommendedTaskOrder: [
      lateTaskId('elite', 'thalmund-blueberry-pie'),
      lateTaskId('elite', 'city-of-um-owls'),
      lateTaskId('elite', 'death-skull-tier-90'),
      lateTaskId('elite', 'first-necromancer-equipment'),
      lateTaskId('elite', 'soul-rune-soul-cape'),
      lateTaskId('elite', 'nakatra-100'),
      lateTaskId('elite', 'gate-of-elidinis-100'),
      lateTaskId('elite', 'elite-underworld-achievements'),
    ],
    estimatedInternalTravelSeconds: 240,
    description: 'City achievements, tier-90 Necromancy equipment, Soul Altar preparation, and 100-completion boss goals.',
    reviewStatus: 'needs-review',
    notes: ['The Soul Altar and boss arenas remain outside the current detailed world graph.'],
  },
  {
    id: misthalinEliteMasterClusterIds.eliteVarrock,
    name: 'Elite Varrock & Elder God Wars Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.archaeologyCampus,
    taskIds: eliteVarrockTasks,
    serviceTags: ['bank', 'archaeology', 'combat-area', 'runecrafting'],
    activityTags: ['bossing', 'collection', 'skilling'],
    sharedItemIds: [],
    recommendedTaskOrder: [
      lateTaskId('elite', 'craft-100-earth-runes'),
      lateTaskId('elite', 'summer-pie-cooking-guild'),
      lateTaskId('elite', 'croesus'),
      lateTaskId('elite', 'defeat-tzkal-zuk'),
      lateTaskId('elite', 'equip-leng-weapon'),
      lateTaskId('elite', 'croesus-100'),
      lateTaskId('elite', 'kerapac-100'),
      lateTaskId('elite', 'arch-glacor-hard-mode-100'),
      lateTaskId('elite', 'defeat-tzkal-zuk-10'),
    ],
    estimatedInternalTravelSeconds: 300,
    description: 'High-level Varrock skilling, equipment, Croesus, Elder God Wars, and TzKal-Zuk progression.',
    reviewStatus: 'needs-review',
    notes: ['Only the 100-earth-rune action is intended for normal routing; all boss and equipment goals remain manual.'],
  },
  {
    id: misthalinEliteMasterClusterIds.masterCityOfUm,
    name: 'Master City of Um Combat Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinExtendedLocationIds.cityOfUm,
    taskIds: masterCityOfUmTasks,
    serviceTags: ['bank', 'combat-area'],
    activityTags: ['bossing'],
    sharedItemIds: [],
    recommendedTaskOrder: masterCityOfUmTasks,
    estimatedInternalTravelSeconds: 180,
    description: 'Complete combat-achievement suites for the Sanctum of Rebirth and Rasial.',
    reviewStatus: 'needs-review',
    notes: ['These are long-term achievement goals and never enter the automatic Next 10 task queue.'],
  },
  {
    id: misthalinEliteMasterClusterIds.masterVarrock,
    name: 'Master Varrock Equipment Goals',
    regionId: MISHTHALIN_ID,
    centerLocationId: misthalinLocationIds.archaeologyCampus,
    taskIds: masterVarrockTasks,
    serviceTags: ['bank', 'archaeology', 'combat-area'],
    activityTags: ['collection'],
    sharedItemIds: [],
    recommendedTaskOrder: masterVarrockTasks,
    estimatedInternalTravelSeconds: 180,
    description: 'Best-in-slot weapon and igneous cape goals tied to Varrock-locality endgame encounters.',
    reviewStatus: 'needs-review',
    notes: ['All Master equipment records are player-controlled goals rather than route steps.'],
  },
];
