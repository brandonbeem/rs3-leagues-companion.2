import { ids } from '../../core/ids';
import type { TaskCategory, TaskDefinition, TaskRequirements } from '../../core/tasks/types';
import type { SourceReference } from '../../core/world/types';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinExtendedLocationIds } from '../world/misthalinExtendedLocations';

const checkedAt = '2026-08-04';
const catalystTasks: SourceReference = {
  title: 'Catalyst League tasks',
  wikiPath: '/w/Catalyst_League/Tasks',
  note: 'Canonical Hard-tier wording, locality, requirements, points, and completion-rate data.',
  checkedAt,
};

const requirements = (partial: Partial<TaskRequirements> = {}): TaskRequirements => ({
  skills: partial.skills ?? [],
  items: partial.items ?? [],
  quests: partial.quests ?? [],
  unlocks: partial.unlocks ?? [],
  completedTaskIds: partial.completedTaskIds ?? [],
});

type HardTaskInput = {
  slug: string;
  name: string;
  information: string;
  locality: string;
  locationId: TaskDefinition['locationId'];
  category: TaskCategory;
  requirements?: Partial<TaskRequirements>;
  estimatedSeconds?: number | null;
  completionRate?: number;
  manual?: boolean;
  review?: TaskDefinition['reviewStatus'];
  notes?: string[];
};

const hardTask = (input: HardTaskInput): TaskDefinition => ({
  id: ids.task(`catalyst-misthalin-hard-${input.slug}`),
  name: input.name,
  description: input.information,
  information: input.information,
  category: input.category,
  tier: 'hard',
  priority: input.manual ? 'Long Grind' : 'Late',
  points: 80,
  locality: input.locality,
  regionId: MISHTHALIN_ID,
  locationId: input.locationId,
  requirements: requirements(input.requirements),
  recommendedItemIds: [],
  acquisitionSteps: [{
    type: 'perform-action',
    label: input.information,
    locationId: input.locationId ?? undefined,
    notes: input.manual ? 'This remains player-controlled and is not inserted into automatic routes.' : undefined,
  }],
  nearbyTaskIds: [],
  estimatedSeconds: input.estimatedSeconds ?? null,
  routePolicy: input.manual ? 'manual-only' : 'normal',
  reviewStatus: input.review ?? 'verified',
  sources: [catalystTasks],
  completionRate: input.completionRate,
  notes: input.notes,
});

export const misthalinHardTasks: TaskDefinition[] = [
  hardTask({ slug: 'death-esswraith', name: 'Siphon from a death esswraith in the Runespan.', information: 'Siphon from a death esswraith in the Runespan.', locality: 'Misthalin: Draynor Village', locationId: misthalinLocationIds.wizardsTower, category: 'skilling', requirements: { skills: [{ skill: 'Runecrafting', level: 66 }] }, estimatedSeconds: 120, completionRate: 0.251 }),
  hardTask({ slug: 'massive-pouch', name: 'Obtain the Massive Pouch from the Runespan.', information: 'Obtain the massive pouch from the Runespan.', locality: 'Misthalin: Draynor Village', locationId: misthalinLocationIds.wizardsTower, category: 'collection', requirements: { skills: [{ skill: 'Runecrafting', level: 90 }], unlocks: ['1,000 Runespan points'] }, manual: true, completionRate: 0.122 }),
  hardTask({ slug: 'master-runecrafter-outfit', name: 'Equip the full Master Runecrafter skilling outfit.', information: 'Equip the full master runecrafter robes set.', locality: 'Misthalin: Draynor Village', locationId: misthalinLocationIds.wizardsTower, category: 'collection', requirements: { skills: [{ skill: 'Runecrafting', level: 50 }], unlocks: ['Full master runecrafter robes set'] }, manual: true, completionRate: 0.035 }),

  hardTask({ slug: 'hard-varrock-achievements', name: 'Complete the task set: Hard Varrock.', information: 'Complete all Hard Varrock achievements and claim the rewards from Vannaka in Edgeville.', locality: 'Misthalin: Edgeville', locationId: misthalinLocationIds.edgevilleLodestone, category: 'other', unlocks: undefined, requirements: { unlocks: ['Hard Varrock achievements'] }, manual: true, completionRate: 0.002 }),
  hardTask({ slug: 'waka-canoe-edgeville', name: 'Make a waka canoe near Edgeville.', information: 'Make a waka canoe near Edgeville.', locality: 'Misthalin: Edgeville', locationId: misthalinLocationIds.edgevilleCanoe, category: 'skilling', requirements: { skills: [{ skill: 'Woodcutting', level: 57 }] }, estimatedSeconds: 45, completionRate: 0.456 }),
  hardTask({ slug: 'edgeville-elder-tree', name: 'Chop down the Edgeville elder tree.', information: 'Chop down the elder tree in Edgeville.', locality: 'Misthalin: Edgeville', locationId: misthalinLocationIds.edgevilleLodestone, category: 'skilling', requirements: { skills: [{ skill: 'Woodcutting', level: 90 }] }, estimatedSeconds: 90, completionRate: 0.151, review: 'needs-review', notes: ['A dedicated Edgeville elder-tree node should be added before final route scoring.'] }),

  hardTask({ slug: 'fort-workshop-tier-3', name: 'Upgrade the workshop in Fort Forinthry to Tier 3.', information: 'Upgrade the Fort Forinthry workshop to tier 3.', locality: 'Misthalin: Fort Forinthry', locationId: misthalinExtendedLocationIds.fortForinthry, category: 'skilling', requirements: { skills: [{ skill: 'Construction', level: 75 }], quests: ['New Foundations'] }, manual: true, completionRate: 0.06 }),

  hardTask({ slug: 'enter-zanaris', name: 'Enter Zanaris via Lumbridge Swamp.', information: 'Enter Zanaris through the shed in Lumbridge Swamp.', locality: 'Misthalin: Lumbridge', locationId: misthalinLocationIds.lumbridgeSwampMine, category: 'exploration', requirements: { quests: ['Lost City (partial)'] }, manual: true, completionRate: 0.481 }),
  hardTask({ slug: 'hard-lumbridge-achievements', name: 'Complete the task set: Hard Lumbridge.', information: 'Complete all Hard Lumbridge achievements and claim the rewards from Ned.', locality: 'Misthalin: Lumbridge', locationId: misthalinLocationIds.draynorVillage, category: 'other', requirements: { unlocks: ['Hard Lumbridge achievements'] }, manual: true, completionRate: 0.068 }),
  hardTask({ slug: 'unlock-bladed-dive', name: 'Unlock the Bladed Dive ability from Shattered Worlds.', information: 'Unlock Bladed Dive from Shattered Worlds.', locality: 'Misthalin: Lumbridge', locationId: misthalinExtendedLocationIds.lumbridgeShatteredWorlds, category: 'combat', requirements: { unlocks: ['63,000,000 shattered anima'] }, manual: true, completionRate: 0.023 }),
  hardTask({ slug: 'mithril-platebody-draynor-sewers', name: 'Smith a mithril platebody on the anvil in the jailhouse sewers.', information: 'Smith a mithril platebody on the anvil in Draynor Sewers.', locality: 'Misthalin: Lumbridge', locationId: misthalinLocationIds.draynorVillage, category: 'skilling', requirements: { skills: [{ skill: 'Smithing', level: 30 }], unlocks: ['Mithril bars for a platebody'] }, manual: true, completionRate: 0.562, review: 'needs-review' }),
  hardTask({ slug: 'grow-magic-tree-lumbridge', name: 'Fully grow a magic tree in Lumbridge.', information: 'Fully grow a magic tree in the Lumbridge tree patch.', locality: 'Misthalin: Lumbridge', locationId: misthalinLocationIds.lumbridgeCourtyard, category: 'skilling', requirements: { skills: [{ skill: 'Farming', level: 75 }], unlocks: ['Magic tree seed and tree-patch access'] }, manual: true, completionRate: 0.134 }),

  hardTask({ slug: 'defeat-hermod', name: 'Defeat Hermod, the Spirit of War.', information: 'Defeat Hermod, the Spirit of War once.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'bossing', requirements: { quests: ['The Spirit of War'] }, manual: true, completionRate: 0.135 }),
  hardTask({ slug: 'defeat-hermod-100', name: 'Defeat Hermod, the Spirit of War 100 times.', information: 'Defeat Hermod, the Spirit of War 100 times.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'bossing', requirements: { quests: ['The Spirit of War'], unlocks: ['100 Hermod kills'] }, manual: true, completionRate: 0.006 }),
  hardTask({ slug: 'dead-beats', name: 'Rest whilst listening to the Dead Beats in the City of Um.', information: 'Complete the Do You Like Jazz? achievement.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'exploration', requirements: { quests: ['That Old Black Magic'] }, manual: true, completionRate: 0.009 }),
  hardTask({ slug: 'smelt-necronium-um', name: 'Smelt a necronium bar at the smithy in the City of Um.', information: 'Complete the Necro Necronium achievement by smelting a necronium bar in Um.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'skilling', requirements: { skills: [{ skill: 'Smithing', level: 70 }], quests: ['Necromancy! (partial)'], unlocks: ['Necronium ore materials'] }, manual: true, completionRate: 0.244 }),
  hardTask({ slug: 'passing-bracelet', name: 'Create a passing bracelet in the City of Um.', information: 'Create a passing bracelet, performing every step in the City of Um.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'collection', requirements: { skills: [{ skill: 'Necromancy', level: 60 }, { skill: 'Crafting', level: 79 }, { skill: 'Magic', level: 68 }], unlocks: ['Ensouled bar', 'Moonstone', 'Level-5 Enchant runes'] }, manual: true, completionRate: 0.044 }),
  hardTask({ slug: 'ghostly-impling', name: 'Catch a ghostly impling while wearing full ghostly robes.', information: 'Complete the Ghost Hunter achievement.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'collection', requirements: { skills: [{ skill: 'Hunter', level: 68 }], quests: ['The Curse of Zaros (miniquest)'], unlocks: ['Full ghostly robes'] }, manual: true, completionRate: 0.008 }),
  hardTask({ slug: 'death-skull-tier-70', name: 'Upgrade a set of Death Skull equipment to tier 70.', information: 'Upgrade a set of Death Skull equipment to tier 70.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'collection', requirements: { skills: [{ skill: 'Necromancy', level: 70 }], quests: ['The Spirit of War'], unlocks: ["Kili's Knowledge V"] }, manual: true, completionRate: 0.124 }),
  hardTask({ slug: 'powerful-communion', name: 'Complete a Powerful Communion ritual.', information: 'Complete a powerful communion ritual.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, category: 'skilling', requirements: { skills: [{ skill: 'Necromancy', level: 90 }] }, estimatedSeconds: 120, completionRate: 0.047 }),
  hardTask({ slug: 'conjure-undead-army', name: 'Conjure an undead army at the City of Um ritual site.', information: 'Conjure an undead army at the Um ritual site.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, category: 'combat', requirements: { skills: [{ skill: 'Necromancy', level: 99 }], unlocks: ['Conjure Undead Army unlocked in the Well of Souls'] }, manual: true, completionRate: 0.057 }),
  hardTask({ slug: 'defeat-nakatra', name: 'Defeat Nakatra, Devourer Eternal.', information: 'Defeat Nakatra, Devourer Eternal once.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'bossing', requirements: { quests: ['Necromancy!', 'Soul Searching'] }, manual: true, completionRate: 0.059 }),
  hardTask({ slug: 'gate-of-elidinis', name: 'Cleanse the Gate of Elidinis.', information: 'Cleanse the Gate of Elidinis once.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'bossing', requirements: { quests: ['Ode of the Devourer or Soul Searching with tier 4 access'] }, manual: true, completionRate: 0.248 }),
  hardTask({ slug: 'hard-underworld-achievements', name: 'Complete the task set: Hard Underworld.', information: 'Complete the Hard Underworld achievements.', locality: 'Misthalin: City of Um', locationId: misthalinExtendedLocationIds.cityOfUm, category: 'other', requirements: { unlocks: ['Hard Underworld achievements'] }, manual: true, completionRate: 0.005 }),

  hardTask({ slug: 'family-crest-gauntlets', name: 'Obtain a new set of Family Crest gauntlets from Dimintheis.', information: 'Obtain a replacement set of family gauntlets from Dimintheis.', locality: 'Misthalin: Varrock', locationId: misthalinLocationIds.varrockCenter, category: 'collection', requirements: { quests: ['Family Crest'] }, manual: true, completionRate: 0.042 }),
  hardTask({ slug: 'romily-wild-pie', name: 'Talk to Romily Weaklax and give him a wild pie.', information: 'Give Romily Weaklax a wild pie.', locality: 'Misthalin: Varrock', locationId: misthalinExtendedLocationIds.cooksGuild, category: 'collection', requirements: { skills: [{ skill: 'Cooking', level: 85 }], unlocks: ['Wild pie'] }, manual: true, completionRate: 0.024 }),
  hardTask({ slug: 'three-archaeology-relics', name: 'Harness the power of three Archaeology relics at once.', information: 'Activate three Archaeology relic powers at the same time.', locality: 'Misthalin: Varrock', locationId: misthalinLocationIds.archaeologyCampus, category: 'skilling', requirements: { skills: [{ skill: 'Archaeology', level: 25 }], unlocks: ['Three relic powers', 'Hand of glory relic or equivalent monolith power'] }, manual: true, completionRate: 0.173 }),
  hardTask({ slug: 'dark-animica-50', name: 'Mine 50 dark animica from the Empty Throne Room.', information: 'Mine 50 dark animica in the Empty Throne Room.', locality: 'Misthalin: Varrock', locationId: misthalinLocationIds.varrockCenter, category: 'skilling', requirements: { skills: [{ skill: 'Mining', level: 90 }] }, estimatedSeconds: 420, completionRate: 0.349, review: 'needs-review', notes: ['A dedicated Empty Throne Room location node is still needed.'] }),
  hardTask({ slug: 'defeat-kerapac', name: 'Defeat Kerapac, the bound.', information: 'Defeat Kerapac, the bound once.', locality: 'Misthalin: Varrock', locationId: misthalinLocationIds.archaeologyCampus, category: 'bossing', manual: true, completionRate: 0.145 }),
  hardTask({ slug: 'defeat-arch-glacor', name: 'Defeat the Arch-Glacor.', information: 'Defeat the Arch-Glacor once.', locality: 'Misthalin: Varrock', locationId: misthalinLocationIds.archaeologyCampus, category: 'bossing', manual: true, completionRate: 0.377 }),
];
