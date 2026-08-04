import { ids } from '../../core/ids';
import type { TaskDefinition } from '../../core/tasks/types';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';

const sourceUrl = 'https://runescape.wiki/w/Catalyst_League/Tasks';
const checkedAt = '2026-08-04';
const empty = () => ({ skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] });

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
  cookRatMeat: ids.task('misthalin-lumbridge-cook-rat-meat'),
  mineIronLumbridge: ids.task('misthalin-lumbridge-mine-iron'),
  stealTea: ids.task('misthalin-varrock-steal-tea'),
  archaeologyTutorial: ids.task('misthalin-varrock-archaeology-tutorial'),
} as const;

const bucket = ids.item('bucket');
const ballOfWool = ids.item('ball-of-wool');
const ratMeat = ids.item('raw-rat-meat');

export const misthalinEarlyTasks: TaskDefinition[] = [
  {
    id: misthalinEarlyTaskIds.tutorialRelic,
    name: 'Progress through the Leagues tutorial to unlock your first relic.',
    description: 'Progress through the Leagues tutorial to unlock your first relic.',
    category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: empty(), recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [misthalinEarlyTaskIds.talkHans],
    estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.climbWizardsTower,
    name: "Climb to the top of the Wizards' Tower.", description: "Climb to the top of the Wizards' Tower.",
    category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.wizardsTower, requirements: empty(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: "Travel to the Wizards' Tower", locationId: misthalinLocationIds.wizardsTower }],
    nearbyTaskIds: [], estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.nedRope,
    name: 'Have Ned make you some rope from balls of wool.', description: 'Have Ned make you some rope from 4 balls of wool.',
    category: 'economy', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.draynorVillage,
    requirements: { ...empty(), items: [{ itemId: ballOfWool, quantity: 4, consumed: true }] }, recommendedItemIds: [ballOfWool],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain 4 balls of wool', itemId: ballOfWool, quantity: 4 }, { type: 'travel', label: 'Take them to Ned in Draynor Village', locationId: misthalinLocationIds.draynorVillage }],
    nearbyTaskIds: [], estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.killMugger,
    name: 'Kill a mugger near the Edgeville lodestone.', description: 'Kill a mugger near the Edgeville lodestone.',
    category: 'combat', tier: 'easy', points: 10, locality: 'Misthalin: Edgeville', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.edgevilleLodestone, requirements: empty(), recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [],
    estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.mineCoalGunnarsgrunn,
    name: 'Mine some coal in the centre of Barbarian Village.', description: 'Mine some coal in the centre of Gunnarsgrunn (Barbarian Village).',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Edgeville', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.gunnarsgrunnMines, requirements: { ...empty(), skills: [{ skill: 'Mining', level: 20 }] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 20 Mining' }], nearbyTaskIds: [],
    estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.killGiantRat,
    name: 'Kill a giant rat in Lumbridge Swamp.', description: 'Kill a giant rat in Lumbridge Swamp.',
    category: 'combat', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeSwampMine, requirements: empty(), recommendedItemIds: [], acquisitionSteps: [],
    nearbyTaskIds: [misthalinEarlyTaskIds.cookRatMeat], estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.killGoblin,
    name: 'Kill a goblin in Lumbridge.', description: 'Kill a goblin in Lumbridge.', category: 'combat', tier: 'easy', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: empty(), recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [misthalinEarlyTaskIds.talkHans],
    estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.killGiantSpider,
    name: 'Kill a giant spider in Lumbridge or Lumbridge Swamp.', description: 'Kill a giant spider in Lumbridge or Lumbridge Swamp.',
    category: 'combat', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeSwampMine, requirements: empty(), recommendedItemIds: [], acquisitionSteps: [], nearbyTaskIds: [],
    estimatedSeconds: 30, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.milkCow,
    name: 'Milk a cow.', description: 'Milk a cow.', category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCowField,
    requirements: { ...empty(), items: [{ itemId: bucket, quantity: 1, consumed: false }] }, recommendedItemIds: [bucket],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain a bucket', itemId: bucket, quantity: 1 }, { type: 'travel', label: 'Travel to the Lumbridge cow field', locationId: misthalinLocationIds.lumbridgeCowField }],
    nearbyTaskIds: [], estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.talkHans,
    name: 'Talk to Hans and find out how old you are.', description: 'Talk to Hans and find out how old you are.',
    category: 'exploration', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeCourtyard, requirements: empty(), recommendedItemIds: [], acquisitionSteps: [],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGoblin], estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.catchShrimp,
    name: 'Catch some shrimp in the fishing spot to the east of Lumbridge Swamp.',
    description: 'Catch shrimp using the net option on the net/bait fishing spot east of Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeRiver, requirements: { ...empty(), skills: [{ skill: 'Fishing', level: 1 }] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'travel', label: 'Travel to the fishing spot east of Lumbridge Swamp', locationId: misthalinLocationIds.lumbridgeRiver }],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGiantRat, misthalinEarlyTaskIds.cookRatMeat], estimatedSeconds: 25,
    routePolicy: 'normal', reviewStatus: 'needs-review', sourceUrl, sourceCheckedAt: checkedAt,
    notes: ['The task is verified; the current location is an approximate route anchor until the exact fishing-spot node is added.'],
  },
  {
    id: misthalinEarlyTaskIds.cookRatMeat,
    name: 'Cook some rat meat on a fire in Lumbridge Swamp.', description: 'Cook rat meat on a campfire in Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeSwampMine,
    requirements: { ...empty(), skills: [{ skill: 'Cooking', level: 1 }], items: [{ itemId: ratMeat, quantity: 1, consumed: true }] },
    recommendedItemIds: [ratMeat], acquisitionSteps: [{ type: 'obtain-item', label: 'Kill a giant rat and obtain raw rat meat', itemId: ratMeat, quantity: 1 }, { type: 'perform-action', label: 'Light or use a campfire in Lumbridge Swamp' }],
    nearbyTaskIds: [misthalinEarlyTaskIds.killGiantRat], estimatedSeconds: 35, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.mineIronLumbridge,
    name: 'Mine iron ore from the mining site south-west of Lumbridge Swamp.', description: 'Mine iron ore from the mining site south-west of Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeSwampMine, requirements: { ...empty(), skills: [{ skill: 'Mining', level: 10 }] },
    recommendedItemIds: [], acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 10 Mining' }], nearbyTaskIds: [],
    estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.stealTea,
    name: 'Steal from the Varrock tea stall.', description: 'Steal from the Varrock tea stall.', category: 'skilling', tier: 'easy', points: 10,
    locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.varrockCenter,
    requirements: { ...empty(), skills: [{ skill: 'Thieving', level: 5 }] }, recommendedItemIds: [],
    acquisitionSteps: [{ type: 'train-skill', label: 'Reach level 5 Thieving' }], nearbyTaskIds: [], estimatedSeconds: 15,
    routePolicy: 'normal', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
  {
    id: misthalinEarlyTaskIds.archaeologyTutorial,
    name: 'Complete the Archaeology tutorial.', description: 'Complete the Archaeology tutorial.', category: 'skilling', tier: 'easy', points: 10,
    locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.archaeologyCampus,
    requirements: { ...empty(), skills: [{ skill: 'Archaeology', level: 1 }] }, recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: 'Travel to the Archaeology Campus', locationId: misthalinLocationIds.archaeologyCampus }],
    nearbyTaskIds: [], estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sourceUrl, sourceCheckedAt: checkedAt,
  },
];
