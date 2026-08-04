import { ids } from '../../core/ids';
import type { TaskDefinition, TaskRequirements } from '../../core/tasks/types';
import type { SourceReference } from '../../core/world/types';
import { itemIds } from '../items';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinTaskLocationIds } from '../world/misthalinTaskLocations';

const checkedAt = '2026-08-04';
const source = (title: string, wikiPath: string, note?: string): SourceReference => ({ title, wikiPath, note, checkedAt });
const catalystTasks = source('Catalyst League tasks', '/w/Catalyst_League/Tasks', 'Canonical wording, locality, requirements, points, and completion-rate data.');

const requirements = (partial: Partial<TaskRequirements> = {}): TaskRequirements => ({
  skills: partial.skills ?? [], items: partial.items ?? [], quests: partial.quests ?? [],
  unlocks: partial.unlocks ?? [], completedTaskIds: partial.completedTaskIds ?? [],
});

export const misthalinExpansionTaskIds = {
  milkCow: ids.task('catalyst-misthalin-lumbridge-milk-cow'),
  smeltSteel: ids.task('catalyst-misthalin-lumbridge-smelt-steel-bar'),
  cookRatMeat: ids.task('catalyst-misthalin-lumbridge-cook-rat-meat'),
  craftWaterRune: ids.task('catalyst-misthalin-lumbridge-craft-water-rune'),
  nedRope: ids.task('catalyst-misthalin-draynor-ned-rope'),
  fireEssling: ids.task('catalyst-misthalin-draynor-fire-essling'),
  earthAltar: ids.task('catalyst-misthalin-varrock-enter-earth-altar'),
  elsieStory: ids.task('catalyst-misthalin-varrock-elsie-story'),
  strayDog: ids.task('catalyst-misthalin-varrock-stray-dog-bones'),
  willowLumbridge: ids.task('catalyst-misthalin-lumbridge-cut-willow'),
  waterRunes50: ids.task('catalyst-misthalin-lumbridge-craft-50-water-runes'),
  pureEssence50: ids.task('catalyst-misthalin-varrock-mine-50-pure-essence'),
  varrockGuard: ids.task('catalyst-misthalin-varrock-pickpocket-guard'),
  brightMemories50: ids.task('catalyst-misthalin-varrock-50-bright-memories'),
} as const;

export const misthalinExpansionTasks: TaskDefinition[] = [
  {
    id: misthalinExpansionTaskIds.milkCow, name: 'Milk a cow.', description: 'Use a bucket on a dairy cow in the Lumbridge cow field.', information: 'Milk a cow.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeCowField, requirements: requirements({ items: [{ itemId: itemIds.bucket, quantity: 1, label: 'Bucket' }] }), recommendedItemIds: [itemIds.bucket],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring or obtain a bucket before visiting the cow field.', itemId: itemIds.bucket, quantity: 1 }, { type: 'perform-action', label: 'Use the bucket on a dairy cow.', locationId: misthalinLocationIds.lumbridgeCowField }], nearbyTaskIds: [], estimatedSeconds: 25,
    routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.891,
  },
  {
    id: misthalinExpansionTaskIds.smeltSteel, name: 'Smelt a steel bar in the furnace in Lumbridge.', description: 'Smelt an iron ore and coal at the Lumbridge furnace.', information: 'Smelt a steel bar in the furnace in Lumbridge using an iron ore and coal.',
    category: 'skilling', tier: 'easy', priority: 'Early', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeCastle, requirements: requirements({ skills: [{ skill: 'Smithing', level: 20 }], items: [{ itemId: itemIds.ironOre, quantity: 1, consumed: true }, { itemId: itemIds.coal, quantity: 1, consumed: true }] }), recommendedItemIds: [itemIds.ironOre, itemIds.coal],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring one iron ore and one coal.', itemId: itemIds.ironOre, quantity: 1 }, { type: 'perform-action', label: 'Use the Lumbridge furnace to smelt one steel bar.', locationId: misthalinLocationIds.lumbridgeCastle }], nearbyTaskIds: [], estimatedSeconds: 35,
    routePolicy: 'requires-item-owned', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.681, notes: ['The task is verified; the furnace node is approximate until a dedicated location is added.'],
  },
  {
    id: misthalinExpansionTaskIds.cookRatMeat, name: 'Cook some rat meat on a fire in Lumbridge Swamp.', description: 'Cook raw rat meat on a campfire in Lumbridge Swamp.', information: 'Cook some rat meat on a campfire in Lumbridge Swamp.',
    category: 'skilling', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.lumbridgeSwampCombat, requirements: requirements({ skills: [{ skill: 'Cooking', level: 1 }], items: [{ itemId: itemIds.rawRatMeat, quantity: 1, consumed: true }] }), recommendedItemIds: [itemIds.rawRatMeat],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Kill a rat and keep one raw rat meat.', itemId: itemIds.rawRatMeat, quantity: 1, locationId: misthalinTaskLocationIds.lumbridgeSwampCombat }, { type: 'perform-action', label: 'Cook the raw rat meat on a campfire in the swamp.', locationId: misthalinTaskLocationIds.lumbridgeSwampCombat }], nearbyTaskIds: [], estimatedSeconds: 45,
    routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.883,
  },
  {
    id: misthalinExpansionTaskIds.craftWaterRune, name: 'Craft a water rune at the Water Altar.', description: 'Enter the Water Altar and craft at least one water rune.', information: 'Craft a water rune at the Water altar.',
    category: 'skilling', tier: 'easy', priority: 'Early', points: 10, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.lumbridgeSwampFishing, requirements: requirements({ skills: [{ skill: 'Runecrafting', level: 5 }], items: [{ itemId: itemIds.runeEssence, quantity: 1, consumed: true }, { itemId: itemIds.waterTalisman, quantity: 1, label: 'Water talisman or equivalent' }] }), recommendedItemIds: [itemIds.runeEssence, itemIds.waterTalisman],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring rune essence and Water Altar access.', itemId: itemIds.runeEssence, quantity: 1 }, { type: 'perform-action', label: 'Enter the Water Altar and craft a water rune.' }], nearbyTaskIds: [], estimatedSeconds: 55,
    routePolicy: 'requires-item-owned', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.571, notes: ['A dedicated Water Altar graph node is still needed.'],
  },
  {
    id: misthalinExpansionTaskIds.nedRope, name: 'Have Ned make you some rope from balls of wool.', description: 'Give Ned four balls of wool and ask him to make rope.', information: 'Have Ned make you some rope from 4 balls of wool.',
    category: 'collection', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.draynorVillage, requirements: requirements({ items: [{ itemId: itemIds.ballOfWool, quantity: 4, consumed: true, label: 'Balls of wool' }] }), recommendedItemIds: [itemIds.ballOfWool],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring four balls of wool.', itemId: itemIds.ballOfWool, quantity: 4 }, { type: 'perform-action', label: 'Talk to Ned in Draynor Village and ask him to make rope.', locationId: misthalinLocationIds.draynorVillage }], nearbyTaskIds: [], estimatedSeconds: 30,
    routePolicy: 'requires-item-owned', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.583,
  },
  {
    id: misthalinExpansionTaskIds.fireEssling, name: 'Siphon from a fire essling in the Runespan.', description: 'Enter the Runespan and siphon a fire essling.', information: 'Siphon from a fire essling in the Runespan.',
    category: 'skilling', tier: 'easy', priority: 'Early', points: 10, locality: 'Misthalin: Draynor Village', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.wizardsTower, requirements: requirements({ skills: [{ skill: 'Runecrafting', level: 14 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'travel', label: 'Enter the Runespan through Wizards’ Tower.' }, { type: 'perform-action', label: 'Find and siphon a fire essling.' }], nearbyTaskIds: [], estimatedSeconds: 90,
    routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.539,
  },
  {
    id: misthalinExpansionTaskIds.earthAltar, name: 'Enter the Earth Altar using an earth tiara or talisman.', description: 'Use an earth tiara, talisman, or equivalent to enter the Earth Altar.', information: 'Enter the earth altar using an earth tiara or talisman.',
    category: 'exploration', tier: 'easy', priority: 'Early', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.varrockSouthEast, requirements: requirements({ skills: [{ skill: 'Runecrafting', level: 1 }], items: [{ itemId: itemIds.earthTalisman, quantity: 1, label: 'Earth tiara, talisman, or equivalent' }] }), recommendedItemIds: [itemIds.earthTalisman],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring Earth Altar access.', itemId: itemIds.earthTalisman, quantity: 1 }, { type: 'perform-action', label: 'Enter the Earth Altar.' }], nearbyTaskIds: [], estimatedSeconds: 45,
    routePolicy: 'requires-item-owned', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.506, notes: ['A dedicated Earth Altar graph node is still needed.'],
  },
  {
    id: misthalinExpansionTaskIds.elsieStory, name: 'Have Elsie tell you a story.', description: 'Take a cup of tea to Elsie upstairs in Varrock church.', information: 'Have Elsie tell you a story; she is upstairs in the church in Varrock and must be given a cup of tea.',
    category: 'exploration', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.varrockCenter, requirements: requirements({ items: [{ itemId: itemIds.cupOfTea, quantity: 1, consumed: true }] }), recommendedItemIds: [itemIds.cupOfTea],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Bring one cup of tea.', itemId: itemIds.cupOfTea, quantity: 1 }, { type: 'perform-action', label: 'Go upstairs in Varrock church and give the tea to Elsie.' }], nearbyTaskIds: [], estimatedSeconds: 35,
    routePolicy: 'requires-item-owned', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.648, notes: ['Varrock church will receive its own graph node during location refinement.'],
  },
  {
    id: misthalinExpansionTaskIds.strayDog, name: "Give a bone to one of Varrock's stray dogs.", description: 'Use bones on a Varrock stray dog or your pet stray dog.', information: "Use some bones on one of Varrock's stray dogs (or your pet stray dog if you have one).",
    category: 'exploration', tier: 'easy', priority: 'Quick Win', points: 10, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.varrockCenter, requirements: requirements({ items: [{ itemId: itemIds.bones, quantity: 1, consumed: true }] }), recommendedItemIds: [itemIds.bones],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Keep one set of bones from a nearby combat task.', itemId: itemIds.bones, quantity: 1 }, { type: 'perform-action', label: 'Use the bones on a Varrock stray dog.' }], nearbyTaskIds: [], estimatedSeconds: 25,
    routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.737,
  },
  {
    id: misthalinExpansionTaskIds.willowLumbridge, name: 'Cut a willow tree east of Lumbridge Castle.', description: 'Cut the willow tree east of Lumbridge Castle by the River Lum bridge.', information: 'Cut the willow tree east of Lumbridge Castle, by the bridge across the River Lum.',
    category: 'skilling', tier: 'medium', priority: 'Early', points: 30, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.lumbridgeRiver, requirements: requirements({ skills: [{ skill: 'Woodcutting', level: 20 }] }), recommendedItemIds: [],
    acquisitionSteps: [{ type: 'perform-action', label: 'Cut the willow tree beside the east Lumbridge bridge.', locationId: misthalinLocationIds.lumbridgeRiver }], nearbyTaskIds: [], estimatedSeconds: 30,
    routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.712,
  },
  {
    id: misthalinExpansionTaskIds.waterRunes50, name: 'Craft 50 water runes.', description: 'Craft a total of 50 water runes at the Water Altar.', information: 'Craft 50 water runes.',
    category: 'skilling', tier: 'medium', priority: 'Mid', points: 30, locality: 'Misthalin: Lumbridge', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.lumbridgeSwampFishing, requirements: requirements({ skills: [{ skill: 'Runecrafting', level: 5 }], items: [{ itemId: itemIds.runeEssence, quantity: 50, consumed: true }, { itemId: itemIds.waterTalisman, quantity: 1, label: 'Water talisman or equivalent' }] }), recommendedItemIds: [itemIds.runeEssence, itemIds.waterTalisman],
    acquisitionSteps: [{ type: 'obtain-item', label: 'Prepare enough essence and Water Altar access.', itemId: itemIds.runeEssence, quantity: 50 }, { type: 'perform-action', label: 'Craft 50 water runes.' }], nearbyTaskIds: [], estimatedSeconds: 180,
    routePolicy: 'requires-item-owned', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.561,
  },
  {
    id: misthalinExpansionTaskIds.pureEssence50, name: 'Mine 50 pure essence.', description: 'Mine 50 pure essence in the Rune Essence mine.', information: 'Mine 50 pure essence.',
    category: 'skilling', tier: 'medium', priority: 'Early', points: 30, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinTaskLocationIds.varrockRuneShop, requirements: requirements({ skills: [{ skill: 'Mining', level: 30 }] }), recommendedItemIds: [itemIds.pickaxe],
    acquisitionSteps: [{ type: 'perform-action', label: 'Ask Aubury to teleport you to the essence mine and mine 50 pure essence.', locationId: misthalinTaskLocationIds.varrockRuneShop }], nearbyTaskIds: [], estimatedSeconds: 240,
    routePolicy: 'normal', reviewStatus: 'verified', sources: [catalystTasks], completionRate: 0.722,
  },
  {
    id: misthalinExpansionTaskIds.varrockGuard, name: "Pickpocket a guard in Varrock Palace's courtyard.", description: 'Pickpocket one Varrock guard.', information: 'Pickpocket a Varrock guard.',
    category: 'skilling', tier: 'medium', priority: 'Mid', points: 30, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.varrockCenter, requirements: requirements({ skills: [{ skill: 'Thieving', level: 40 }] }), recommendedItemIds: [], acquisitionSteps: [{ type: 'perform-action', label: 'Pickpocket a guard in Varrock Palace courtyard.' }], nearbyTaskIds: [], estimatedSeconds: 30,
    routePolicy: 'normal', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.485,
  },
  {
    id: misthalinExpansionTaskIds.brightMemories50, name: 'Gather and convert 50 bright memories.', description: 'Gather and convert 50 bright memories.', information: 'Gather and convert 50 bright memories.',
    category: 'skilling', tier: 'medium', priority: 'Mid', points: 30, locality: 'Misthalin: Varrock', regionId: MISHTHALIN_ID,
    locationId: misthalinLocationIds.varrockCenter, requirements: requirements({ skills: [{ skill: 'Divination', level: 20 }] }), recommendedItemIds: [], acquisitionSteps: [{ type: 'perform-action', label: 'Gather and convert 50 bright memories at a bright-wisp colony.' }], nearbyTaskIds: [], estimatedSeconds: 360,
    routePolicy: 'normal', reviewStatus: 'needs-review', sources: [catalystTasks], completionRate: 0.593, notes: ['The task is verified, but a dedicated bright-wisp location node is still needed.'],
  },
];
