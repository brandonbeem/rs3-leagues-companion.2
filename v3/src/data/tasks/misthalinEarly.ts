import { ids } from '../../core/ids';
import type { TaskDefinition } from '../../core/tasks/types';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';

const sourceUrl = 'https://runescape.wiki/w/Catalyst_League/Tasks';
const checkedAt = '2026-08-04';

export const misthalinEarlyTaskIds = {
  tutorialRelic: ids.task('misthalin-lumbridge-tutorial-first-relic'),
  climbWizardsTower: ids.task('misthalin-draynor-climb-wizards-tower'),
  nedRope: ids.task('misthalin-draynor-ned-rope'),
  killMugger: ids.task('misthalin-edgeville-kill-mugger'),
  mineCoalGunnarsgrunn: ids.task('misthalin-gunnarsgrunn-mine-coal'),
  killGiantRat: ids.task('misthalin-lumbridge-kill-giant-rat'),
  killGoblin: ids.task('misthalin-lumbridge-kill-goblin'),
  killGiantSpider: ids.task('misthalin-lumbridge-kill-giant-spider'),
  milkCow: ids.task('misthalin-lumbridge-milk-cow'),
  talkHans: ids.task('misthalin-lumbridge-talk-hans'),
  catchShrimp: ids.task('misthalin-draynor-catch-shrimp-lumbridge-swamp'),
  smeltSteelBar: ids.task('misthalin-lumbridge-smelt-steel-bar'),
  cookRatMeat: ids.task('misthalin-lumbridge-cook-rat-meat'),
  mineIronLumbridge: ids.task('misthalin-lumbridge-mine-iron'),
  mineIronVarrock: ids.task('misthalin-varrock-mine-iron'),
  stealTea: ids.task('misthalin-varrock-steal-tea'),
  archaeologyTutorial: ids.task('misthalin-varrock-archaeology-tutorial'),
} as const;

const bucket = ids.item('bucket');
const ballOfWool = ids.item('ball-of-wool');
const ironOre = ids.item('iron-ore');
const coal = ids.item('coal');
const ratMeat = ids.item('raw-rat-meat');

export const misthalinEarlyTasks: TaskDefinition[] = [
  {
    id: misthalinEarlyTaskIds.tutorialRelic,
    name: 'Progress through the Leagues tutorial to unlock your first relic.',
    description: 'Progress through the Leagues tutorial to unlock your first relic.',
    category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: { skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [misthalinEarlyTaskIds.talkHans],
    estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.climbWizardsTower,
    name: "Climb to the top of the Wizards' Tower.",
    description: "Climb to the top of the Wizards' Tower.",
    category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.wizardsTower,
    requirements: { skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'travel', label: "Travel to the Wizards' Tower", locationId: misthalinLocationIds.wizardsTower }],
    nearbyTaskIds: [], estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.nedRope,
    name: 'Have Ned make you some rope from balls of wool.',
    description: 'Have Ned make you some rope from 4 balls of wool.',
    category: 'economy', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.draynorVillage,
    requirements: { skills: [], items: [{ itemId: ballOfWool, quantity: 4, consumed: true }], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [ballOfWool],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain 4 balls of wool', itemId: ballOfWool, quantity: 4 }, { type: 'travel', label: 'Take them to Ned in Draynor Village', locationId: misthalinLocationIds.draynorVillage }],
    nearbyTaskIds: [], estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.killMugger,
    name: 'Kill a mugger near the Edgeville lodestone.',
    description: 'Kill a mugger near the Edgeville lodestone.',
    category: 'combat', tier: 'easy', points: 10, locality: 'Misthalin: Edgeville',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.edgevilleLodestone,
    requirements: { skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [], estimatedSeconds: 30,
    routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.mineCoalGunnarsgrunn,
    name: 'Mine some coal in the centre of Barbarian Village.',
    description: 'Mine some coal in the centre of Gunnarsgrunn (Barbarian Village).',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Edgeville',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.gunnarsgrunnMines,
    requirements: { skills: [{ skill: 'Mining', level: 20 }], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 20 Mining' }], nearbyTaskIds: [], estimatedSeconds: 20,
    routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  ...[
    [misthalinEarlyTaskIds.killGiantRat, 'Kill a giant rat in Lumbridge Swamp.', 'Kill a giant rat in Lumbridge Swamp.', misthalinLocationIds.lumbridgeSwampMine],
    [misthalinEarlyTaskIds.killGoblin, 'Kill a goblin in Lumbridge.', 'Kill a goblin in Lumbridge.', misthalinLocationIds.lumbridgeCourtyard],
    [misthalinEarlyTaskIds.killGiantSpider, 'Kill a giant spider in Lumbridge or Lumbridge Swamp.', 'Kill a giant spider in Lumbridge or Lumbridge Swamp.', misthalinLocationIds.lumbridgeSwampMine],
  ].map(([id, name, description, locationId]) => ({
    id, name, description, category: 'combat' as const, tier: 'easy' as const, points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId, requirements: { skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [], estimatedSeconds: 30, routePolicy: 'normal' as const,
    reviewStatus: 'verified' as const, sourceUrl, sourceCheckedAt: checkedAt,
  })),
  {
    id: misthalinEarlyTaskIds.milkCow,
    name: 'Milk a cow.', description: 'Milk a cow.', category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCowField,
    requirements: { skills: [], items: [{ itemId: bucket, quantity: 1, consumed: false }], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [bucket], acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain a bucket', itemId: bucket, quantity: 1 }, { type: 'travel', label: 'Travel to the Lumbridge cow field', locationId: misthalinLocationIds.lumbridgeCowField }],
    nearbyTaskIds: [], estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.talkHans,
    name: 'Talk to Hans and find out how old you are.', description: 'Talk to Hans and find out how old you are.', category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: { skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] }, recommendedItemIds: [], acquisitionSteps: [],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGoblin], estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.catchShrimp,
    name: 'Catch some shrimp in the fishing spot to the east of Lumbridge Swamp.',
    description: 'Catch shrimp using the net option on the net/bait fishing spot east of Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeRiver, requirements: { skills: [{ skill: 'Fishing', level: 1 }], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'travel', label: 'Travel to the fishing spot east of Lumbridge Swamp', locationId: misthalinLocationIds.lumbridgeRiver }],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGiantRat, misthalinEarlyTaskIds.cookRatMeat], estimatedSeconds: 25,
    routePolicy: 'normal', reviewStatus: 'needs-review', sourceUrl, sourceCheckedAt: checkedAt,
    notes: ['The official task is verified; the current world node is an approximate route anchor until the exact fishing spot node is added.'],
  },
  {
    id: misthalinEarlyTaskIds.smeltSteelBar,
    name: 'Smelt a steel bar in the furnace in Lumbridge.', description: 'Smelt a steel bar in Lumbridge using an iron ore and coal.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: { skills: [{ skill: 'Smithing', level: 20 }], items: [{ itemId: ironOre, quantity: 1, consumed: true }, { itemId: coal, quantity: 1, consumed: true }], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [ironOre, coal], acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 20 Smithing' }, { type: 'obtain-item', label: 'Obtain 1 iron ore', itemId: ironOre, quantity: 1 }, { type: 'obtain-item', label: 'Obtain 1 coal', itemId: coal, quantity: 1 }],
    nearbyTaskIds: [], estimatedSeconds: 25, routePolicy: 'blocked-review', reviewStatus: 'needs-review', sourceUrl, sourceCheckedAt: checkedAt,
    notes: ['The task wording is verified, but a dedicated Lumbridge furnace world node still needs to be added.'],
  },
  {
    id: misthalinEarlyTaskIds.cookRatMeat,
    name: 'Cook some rat meat on a fire in Lumbridge Swamp.', description: 'Cook rat meat on a campfire in Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeSwampMine,
    requirements: { skills: [{ skill: 'Cooking', level: 1 }], items: [{ itemId: ratMeat, quantity: 1, consumed: true }], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [ratMeat], acquisitionSteps: [{ type: 'obtain-item', label: 'Kill a giant rat and obtain raw rat meat', itemId: ratMeat, quantity: 1 }, { type: 'perform-action', label: 'Light or use a campfire in Lumbridge Swamp' }],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGiantRat], estimatedSeconds: 35, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  ...[
    [misthalinEarlyTaskIds.mineIronLumbridge, 'Mine iron ore from the mining site south-west of Lumbridge Swamp.', 'Mine iron ore from the mining site south-west of Lumbridge Swamp.', misthalinLocationIds.lumbridgeSwampMine, 'Misthalin: Lumbridge'],
    [misthalinEarlyTaskIds.mineIronVarrock, 'Mine some iron ore in the mining spot south-west of Varrock.', 'Mine some iron ore in the mining spot south-west of Varrock.', misthalinLocationIds.varrockWestBank, 'Misthalin: Varrock'],
  ].map(([id, name, description, locationId, locality]) => ({
    id, name, description, category: 'skilling' as const, tier: 'easy' as const, points: 10, locality,
    regionId: MISHTHALIN_ID, locationId, requirements: { skills: [{ skill: 'Mining' as const, level: 10 }], items: [], quests: [], unlocks: [], completedTaskIds: [] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'train-skill' as const, label: 'Reach level 10 Mining' }], nearbyTaskIds: [], estimatedSeconds: 20,
    routePolicy: locationId === misthalinLocationIds.varrockWestBank ? 'blocked-review' as const : 'normal' as const,
    reviewStatus: locationId === misthalinLocationIds.varrockWestBank ? 'needs-review' as const : 'verified' as const,
    sourceUrl, sourceCheckedAt: checkedAt,
    notes: locationId === misthalinLocationIds.varrockWestBank ? ['Exact south-west Varrock mine node still needs to be added.'] : undefined,
  })),
  {
    id: misthalinEarlyTaskIds.stealTea,
    name: 'Steal from the Varrock tea stall.', description: 'Steal from the Varrock tea stall.', category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Varrock',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.varrockCenter,
    requirements: { skills: [{ skill: 'Thieving', level: 5 }], items: [], quests: [], unlocks: [], completedTaskIds: [] }, recommendedItemIds: [],
    acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 5 Thieving' }], nearbyTaskIds: [], estimatedSeconds: 15,
    routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.archaeologyTutorial,
    name: 'Complete the Archaeology tutorial.', description: 'Complete the Archaeology tutorial.', category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Varrock',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.archaeologyCampus,
    requirements: { skills: [{ skill: 'Archaeology', level: 1 }], items: [], quests: [], unlocks: [], completedTaskIds: [] }, recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: 'Travel to the Archaeology Campus', locationId: misthalinLocationIds.archaeologyCampus }], nearbyTaskIds: [], estimatedSeconds: null,
    routePolicy: 'manual-only', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
];
