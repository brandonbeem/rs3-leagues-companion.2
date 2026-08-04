import { ids } from '../../core/ids';
import type { TaskDefinition, TaskRequirements } from '../../core/tasks/types';
import type { SourceReference } from '../../core/world/types';
import { itemIds } from '../items';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinTaskLocationIds } from '../world/misthalinTaskLocations';

const checkedAt = '2026-08-04';
const wikiSource = (title: string, wikiPath: string, note?: string): SourceReference => ({ title, wikiPath, note, checkedAt });
const catalystTasks = wikiSource('Catalyst League tasks', '/w/Catalyst_League/Tasks', 'Canonical wording, locality, requirements, points, and completion-rate data. Legacy IDs were matched to the V20 dataset supplied by the user.');
const firstDay = wikiSource('Catalyst League: The First Day', '/w/Guide:Catalyst_League:_The_First_Day');
const paleWisp = wikiSource('Pale wisp', '/w/Pale_wisp');
const bloodPact = wikiSource('The Blood Pact', '/w/The_Blood_Pact');
const nexus = wikiSource('The Nexus', '/w/The_Nexus');
const teaStall = wikiSource('Tea stall', '/w/Tea_stall');
const archaeology = wikiSource('Archaeology', '/w/Archaeology');
const runeEssence = wikiSource('Rune Essence mine', '/w/Rune_Essence_mine');

const requirements = (partial: Partial<TaskRequirements> = {}): TaskRequirements => ({
  skills: partial.skills ?? [], items: partial.items ?? [], quests: partial.quests ?? [],
  unlocks: partial.unlocks ?? [], completedTaskIds: partial.completedTaskIds ?? [],
});

export const misthalinEarlyTaskIds = {
  homeTeleport: ids.task('catalyst-23-home-teleport-lumbridge'),
  giantSpider: ids.task('catalyst-24-giant-spider-lumbridge'),
  giantRat: ids.task('catalyst-25-giant-rat-lumbridge-swamp'),
  hansAge: ids.task('catalyst-26-hans-age'),
  catchShrimp: ids.task('catalyst-55-catch-shrimp-lumbridge-swamp'),
  swampIron: ids.task('catalyst-56-mine-iron-lumbridge-swamp'),
  paleMemory: ids.task('catalyst-60-harvest-pale-memory'),
  tenPaleMemories: ids.task('catalyst-65-harvest-ten-pale-memories'),
  darkWizard: ids.task('catalyst-69-kill-dark-wizard-varrock'),
  jacquelynTask: ids.task('catalyst-71-jacquelyn-slayer-task'),
  wizardsTowerTop: ids.task('catalyst-72-wizards-tower-top'),
  varrockIron: ids.task('catalyst-73-mine-iron-south-west-varrock'),
  bloodPact: ids.task('catalyst-74-blood-pact'),
  nexusSack: ids.task('catalyst-77-nexus-charmed-sack'),
  archaeologyTutorial: ids.task('catalyst-93-archaeology-tutorial'),
  edgevilleMugger: ids.task('catalyst-97-edgeville-mugger'),
  varrockTeaStall: ids.task('catalyst-111-varrock-tea-stall'),
  zaidaClue: ids.task('catalyst-112-zaida-free-clue'),
  convertPaleMemory: ids.task('catalyst-114-convert-pale-memory'),
  pureEssence: ids.task('catalyst-117-mine-pure-essence'),
} as const;

const lumbridgeCluster = [misthalinEarlyTaskIds.homeTeleport, misthalinEarlyTaskIds.giantSpider, misthalinEarlyTaskIds.giantRat, misthalinEarlyTaskIds.hansAge, misthalinEarlyTaskIds.catchShrimp, misthalinEarlyTaskIds.swampIron, misthalinEarlyTaskIds.jacquelynTask, misthalinEarlyTaskIds.bloodPact, misthalinEarlyTaskIds.nexusSack];
const draynorCluster = [misthalinEarlyTaskIds.paleMemory, misthalinEarlyTaskIds.tenPaleMemories, misthalinEarlyTaskIds.convertPaleMemory, misthalinEarlyTaskIds.wizardsTowerTop];
const varrockCluster = [misthalinEarlyTaskIds.darkWizard, misthalinEarlyTaskIds.varrockIron, misthalinEarlyTaskIds.varrockTeaStall, misthalinEarlyTaskIds.zaidaClue, misthalinEarlyTaskIds.pureEssence, misthalinEarlyTaskIds.archaeologyTutorial];
const nearby = (cluster: readonly string[], current: string) => cluster.filter((id) => id !== current) as TaskDefinition['nearbyTaskIds'];

export const misthalinEarlyTasks: TaskDefinition[] = [
  {
    id: misthalinEarlyTaskIds.homeTeleport, legacyTaskId: 23,
    name: 'Use the Home Teleport spell to return to Lumbridge.',
    description: 'Return to Lumbridge using the Home Teleport spell.', information: 'Use the Home Teleport spell to return to Lumbridge.',
    category: 'exploration', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Global',
    regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Select Lumbridge from the lodestone network and complete the teleport.', locationId: misthalinLocationIds.lumbridgeCourtyard }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.homeTeleport), estimatedSeconds: 15, routePolicy: 'normal', reviewStatus: 'verified',
    sources: [catalystTasks], completionRate: 0.917, notes: ['The source locality is Global; it is anchored to Lumbridge for routing.'],
  },
  {
    id: misthalinEarlyTaskIds.giantSpider, legacyTaskId: 24,
    name: 'Kill a giant spider in Lumbridge or Lumbridge Swamp.', description: 'Defeat one giant spider in an allowed Lumbridge location.',
    information: 'Kill a giant spider in Lumbridge or Lumbridge Swamp.', category: 'combat', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinTaskLocationIds.lumbridgeSwampCombat,
    requirements: requirements(), recommendedItemIds: [], acquisitionSteps: [{ type: 'travel', label: 'Travel into Lumbridge Swamp and find a giant spider.', locationId: misthalinTaskLocationIds.lumbridgeSwampCombat }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.giantSpider), estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.916,
  },
  {
    id: misthalinEarlyTaskIds.giantRat, legacyTaskId: 25,
    name: 'Kill a giant rat in Lumbridge Swamp.', description: 'Defeat one giant rat in Lumbridge Swamp.', information: 'Kill a giant rat in Lumbridge Swamp.',
    category: 'combat', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.lumbridgeSwampCombat, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: 'Travel into Lumbridge Swamp and find a giant rat.', locationId: misthalinTaskLocationIds.lumbridgeSwampCombat }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.giantRat), estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks],
  },
  {
    id: misthalinEarlyTaskIds.hansAge, legacyTaskId: 26,
    name: 'Talk to Hans and find out how old you are.', description: 'Speak to Hans while he patrols the Lumbridge Castle courtyard.',
    information: 'Talk to Hans and find out how old you are.', category: 'exploration', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeCourtyard,
    requirements: requirements(), recommendedItemIds: [], acquisitionSteps: [{ type: 'perform-action', label: 'Find Hans walking around the castle grounds and ask about your age.', locationId: misthalinLocationIds.lumbridgeCourtyard }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.hansAge), estimatedSeconds: 25, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, wikiSource('Hans', '/w/Hans')],
  },
  {
    id: misthalinEarlyTaskIds.catchShrimp, legacyTaskId: 55,
    name: 'Catch some shrimp east of Lumbridge Swamp.', description: 'Use the net option on the fishing spot east of Lumbridge Swamp.',
    information: 'Catch some shrimp by using the net option on the net/bait fishing spot to the east of Lumbridge Swamp.', category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID, locationId: misthalinTaskLocationIds.lumbridgeSwampFishing,
    requirements: requirements({ skills: [{ skill: 'Fishing', level: 1 }], items: [{ itemId: itemIds.smallFishingNet, quantity: 1, mustBeOwnedBeforeRoute: false, label: 'Small fishing net' }] }),
    recommendedItemIds: [itemIds.smallFishingNet], acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain a small fishing net or confirm the League starts with one available.', itemId: itemIds.smallFishingNet, quantity: 1, locationId: misthalinTaskLocationIds.lumbridgeSwampFishing, notes: 'Starting-tool state still needs confirmation; the planner does not assume the net is owned.', reviewStatus: 'needs-review', sources: [catalystTasks] }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.catchShrimp), estimatedSeconds: 40, routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks],
  },
  {
    id: misthalinEarlyTaskIds.swampIron, legacyTaskId: 56,
    name: 'Mine iron ore south-west of Lumbridge Swamp.', description: 'Mine one iron ore at the mining site south-west of Lumbridge Swamp.',
    information: 'Mine iron ore from the mining site south-west of Lumbridge Swamp.', category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinTaskLocationIds.lumbridgeSwampWestMine,
    requirements: requirements({ skills: [{ skill: 'Mining', level: 10 }], items: [{ itemId: itemIds.pickaxe, quantity: 1, mustBeOwnedBeforeRoute: false, label: 'Usable pickaxe or tool-belt pickaxe' }] }),
    recommendedItemIds: [itemIds.pickaxe], acquisitionSteps: [{ type: 'obtain-item', label: 'Confirm a usable pickaxe is carried or available on the tool belt.', itemId: itemIds.pickaxe, quantity: 1, notes: 'Tool-belt ownership will be modelled separately in Milestone 2.3.', reviewStatus: 'needs-review' }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.swampIron), estimatedSeconds: 35, routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks],
  },
  {
    id: misthalinEarlyTaskIds.paleMemory, legacyTaskId: 60,
    name: 'Harvest a memory from a pale wisp.', description: 'Harvest one pale memory at the Draynor pale-wisp colony.', information: 'Harvest a pale memory from a pale wisp.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.draynorPaleWisps, requirements: requirements({ skills: [{ skill: 'Divination', level: 1 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Harvest a pale wisp until a pale memory is received.', locationId: misthalinTaskLocationIds.draynorPaleWisps }],
    nearbyTaskIds: nearby(draynorCluster, misthalinEarlyTaskIds.paleMemory), estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, paleWisp], completionRate: 0.845,
  },
  {
    id: misthalinEarlyTaskIds.tenPaleMemories, legacyTaskId: 65,
    name: 'Harvest 10 memories from a pale wisp.', description: 'Harvest ten pale memories during the same Draynor Divination stop.', information: 'Harvest 10 pale memories from a pale wisp.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.draynorPaleWisps, requirements: requirements({ skills: [{ skill: 'Divination', level: 1 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Continue harvesting pale wisps until ten pale memories have been gathered.', locationId: misthalinTaskLocationIds.draynorPaleWisps }],
    nearbyTaskIds: nearby(draynorCluster, misthalinEarlyTaskIds.tenPaleMemories), estimatedSeconds: 150, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, paleWisp], completionRate: 0.838,
  },
  {
    id: misthalinEarlyTaskIds.darkWizard, legacyTaskId: 69,
    name: 'Kill a dark wizard.', description: 'Defeat a dark wizard south of Varrock.', information: 'Kill a dark wizard.', category: 'combat', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID, locationId: misthalinTaskLocationIds.varrockDarkWizards, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: 'From the Varrock lodestone, move east to the dark wizards.', locationId: misthalinTaskLocationIds.varrockDarkWizards }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.darkWizard), estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, firstDay], completionRate: 0.817,
  },
  {
    id: misthalinEarlyTaskIds.jacquelynTask, legacyTaskId: 71,
    name: 'Complete a task from Jacquelyn, the Lumbridge Slayer master.', description: 'Receive and complete one Slayer assignment from Jacquelyn.',
    information: 'Complete a task from Jacquelyn, the Lumbridge Slayer master.', category: 'combat', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinLocationIds.lumbridgeChurch,
    requirements: requirements({ skills: [{ skill: 'Slayer', level: 1 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Get a Slayer assignment from Jacquelyn, then complete the assigned target.', locationId: misthalinLocationIds.lumbridgeChurch, notes: 'The target and resulting travel vary, so routing must branch after assignment.' }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.jacquelynTask), estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sources: [catalystTasks, wikiSource('Jacquelyn', '/w/Jacquelyn')],
    notes: ['The task is verified, but its completion route cannot be fixed before the assignment is known.'],
  },
  {
    id: misthalinEarlyTaskIds.wizardsTowerTop, legacyTaskId: 72,
    name: 'Climb to the top of the Wizards’ Tower.', description: 'Travel through the Wizards’ Tower and reach its top floor.', information: 'Climb to the top of the Wizards’ Tower.',
    category: 'exploration', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.wizardsTower, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Enter the Wizards’ Tower and climb to the top floor.', locationId: misthalinLocationIds.wizardsTower }],
    nearbyTaskIds: nearby(draynorCluster, misthalinEarlyTaskIds.wizardsTowerTop), estimatedSeconds: 45, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, wikiSource('Wizards’ Tower', '/w/Wizards%27_Tower')],
  },
  {
    id: misthalinEarlyTaskIds.varrockIron, legacyTaskId: 73,
    name: 'Mine iron ore south-west of Varrock.', description: 'Mine one iron ore at the mining spot south-west of Varrock.', information: 'Mine some iron ore in the mining spot south-west of Varrock.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.varrockSouthWestMine,
    requirements: requirements({ skills: [{ skill: 'Mining', level: 10 }], items: [{ itemId: itemIds.pickaxe, quantity: 1, mustBeOwnedBeforeRoute: false, label: 'Usable pickaxe or tool-belt pickaxe' }] }),
    recommendedItemIds: [itemIds.pickaxe], acquisitionSteps: [{ type: 'obtain-item', label: 'Confirm a usable pickaxe is carried or available on the tool belt.', itemId: itemIds.pickaxe, quantity: 1, reviewStatus: 'needs-review' }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.varrockIron), estimatedSeconds: 35, routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.812,
  },
  {
    id: misthalinEarlyTaskIds.bloodPact, legacyTaskId: 74,
    name: 'Complete the quest: The Blood Pact.', description: 'Complete The Blood Pact, beginning in the Lumbridge cemetery area.', information: 'Complete The Blood Pact.',
    category: 'quest', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeChurch, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'complete-quest', label: 'Speak to Xenia in the Lumbridge cemetery and complete The Blood Pact.', locationId: misthalinLocationIds.lumbridgeChurch }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.bloodPact), estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sources: [catalystTasks, bloodPact],
    notes: ['Quest steps are intentionally not guessed by the route engine in this migration batch.'],
  },
  {
    id: misthalinEarlyTaskIds.nexusSack, legacyTaskId: 77,
    name: 'Fill a Charmed Sack with corruption at the Nexus.', description: 'Use a charmed sack at the Nexus activity in Lumbridge Swamp.',
    information: 'Fill a Charmed Sack with corruption at the Nexus in Lumbridge Swamp.', category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10,
    locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID, locationId: misthalinTaskLocationIds.lumbridgeSwampNexus,
    requirements: requirements({ skills: [{ skill: 'Prayer', level: 1 }], items: [{ itemId: itemIds.charmedSack, quantity: 1, mustBeOwnedBeforeRoute: false, label: 'Charmed sack' }] }),
    recommendedItemIds: [itemIds.charmedSack], acquisitionSteps: [{ type: 'obtain-item', label: 'Obtain or confirm the charmed sack used by the Nexus activity.', itemId: itemIds.charmedSack, quantity: 1, locationId: misthalinTaskLocationIds.lumbridgeSwampNexus, notes: 'The exact acquisition interaction is held for Milestone 2.3 rather than guessed.', reviewStatus: 'needs-review', sources: [nexus] }],
    nearbyTaskIds: nearby(lumbridgeCluster, misthalinEarlyTaskIds.nexusSack), estimatedSeconds: null, routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks, nexus],
  },
  {
    id: misthalinEarlyTaskIds.archaeologyTutorial, legacyTaskId: 93,
    name: 'Complete the Archaeology tutorial.', description: 'Complete the level-1 Archaeology tutorial at the Varrock Dig Site campus.', information: 'Complete the Archaeology tutorial.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.archaeologyCampus, requirements: requirements({ skills: [{ skill: 'Archaeology', level: 1 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Begin and finish the Archaeology tutorial at the campus.', locationId: misthalinLocationIds.archaeologyCampus }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.archaeologyTutorial), estimatedSeconds: null, routePolicy: 'manual-only', reviewStatus: 'verified', sources: [catalystTasks, archaeology], completionRate: 0.764,
  },
  {
    id: misthalinEarlyTaskIds.edgevilleMugger, legacyTaskId: 97,
    name: 'Kill a mugger near the Edgeville lodestone.', description: 'Defeat one mugger near the Edgeville lodestone.', information: 'Kill a mugger near the Edgeville lodestone.',
    category: 'combat', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Edgeville', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.edgevilleLodestone, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Locate and defeat a mugger near the Edgeville lodestone.', locationId: misthalinLocationIds.edgevilleLodestone }],
    nearbyTaskIds: [], estimatedSeconds: 40, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks],
  },
  {
    id: misthalinEarlyTaskIds.varrockTeaStall, legacyTaskId: 111,
    name: 'Steal from the Varrock tea stall.', description: 'Steal one cup of tea from the tea stall in south-east Varrock.', information: 'Steal from the Varrock tea stall.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.varrockSouthEast, requirements: requirements({ skills: [{ skill: 'Thieving', level: 5 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Use Steal-from on the tea stall in south-east Varrock.', locationId: misthalinTaskLocationIds.varrockSouthEast }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.varrockTeaStall), estimatedSeconds: 15, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, firstDay, teaStall], completionRate: 0.736,
  },
  {
    id: misthalinEarlyTaskIds.zaidaClue, legacyTaskId: 112,
    name: 'Claim a free clue scroll from Zaida at the Grand Exchange.', description: 'Speak to Zaida at the Grand Exchange and claim the free clue scroll.', information: 'Claim a free clue scroll from Zaida at the Grand Exchange.',
    category: 'collection', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.grandExchange, requirements: requirements(), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Speak to Zaida at the Grand Exchange and claim the free clue scroll.', locationId: misthalinLocationIds.grandExchange }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.zaidaClue), estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, firstDay, wikiSource('Zaida', '/w/Zaida')], completionRate: 0.729,
  },
  {
    id: misthalinEarlyTaskIds.convertPaleMemory, legacyTaskId: 114,
    name: 'Convert at least one pale memory into energy.', description: 'Convert one pale memory at the Draynor Divination crater.', information: 'Convert at least one pale memory into energy.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.draynorPaleWisps, requirements: requirements({ skills: [{ skill: 'Divination', level: 1 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'After harvesting a pale memory, convert it into energy at the crater.', locationId: misthalinTaskLocationIds.draynorPaleWisps }],
    nearbyTaskIds: nearby(draynorCluster, misthalinEarlyTaskIds.convertPaleMemory), estimatedSeconds: 20, routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks, paleWisp],
  },
  {
    id: misthalinEarlyTaskIds.pureEssence, legacyTaskId: 117,
    name: 'Mine 50 pure essence.', description: 'Use Aubury’s access to the Rune Essence mine and mine fifty pure essence.', information: 'Mine 50 pure essence.',
    category: 'skilling', tier: 'medium', priority: 'Early', points: 30, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.varrockRuneShop,
    requirements: requirements({ skills: [{ skill: 'Mining', level: 30 }], items: [{ itemId: itemIds.pickaxe, quantity: 1, mustBeOwnedBeforeRoute: false, label: 'Usable pickaxe or tool-belt pickaxe' }] }),
    recommendedItemIds: [itemIds.pickaxe], acquisitionSteps: [{ type: 'travel', label: 'Travel to Aubury’s Rune Shop in south-east Varrock.', locationId: misthalinTaskLocationIds.varrockRuneShop }, { type: 'perform-action', label: 'Have Aubury teleport you to the Rune Essence mine, then mine 50 essence.', locationId: misthalinTaskLocationIds.varrockRuneShop, sources: [firstDay, runeEssence] }],
    nearbyTaskIds: nearby(varrockCluster, misthalinEarlyTaskIds.pureEssence), estimatedSeconds: null, routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks, firstDay, runeEssence], completionRate: 0.722,
  },
];
