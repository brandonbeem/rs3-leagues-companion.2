import { ids } from '../../core/ids';
import type { SkillName } from '../../core/player/types';
import type { TaskCategory, TaskDefinition, TaskRequirements, TaskTier } from '../../core/tasks/types';
import type { SourceReference } from '../../core/world/types';
import { itemIds } from '../items';
import { MISHTHALIN_ID, misthalinLocationIds } from '../world/misthalin';
import { misthalinExtendedLocationIds } from '../world/misthalinExtendedLocations';

const checkedAt = '2026-08-04';
const catalystTasks: SourceReference = {
  title: 'Catalyst League tasks',
  wikiPath: '/w/Catalyst_League/Tasks',
  note: 'Canonical wording, locality, requirements, points, and completion-rate data.',
  checkedAt,
};

const emptyRequirements = (): TaskRequirements => ({ skills: [], items: [], quests: [], unlocks: [], completedTaskIds: [] });
const skill = (name: SkillName, level: number) => ({ skill: name, level });

type TaskSeed = {
  slug: string;
  name: string;
  information?: string;
  locality: string;
  tier: TaskTier;
  category: TaskCategory;
  locationId: TaskDefinition['locationId'];
  skills?: ReturnType<typeof skill>[];
  quests?: string[];
  unlocks?: string[];
  items?: TaskRequirements['items'];
  completionRate?: number;
  estimatedSeconds?: number | null;
  manual?: boolean;
  review?: 'verified' | 'needs-review';
};

function task(seed: TaskSeed): TaskDefinition {
  const requirements = emptyRequirements();
  requirements.skills = seed.skills ?? [];
  requirements.quests = seed.quests ?? [];
  requirements.unlocks = seed.unlocks ?? [];
  requirements.items = seed.items ?? [];
  const manual = seed.manual || requirements.quests.length > 0;
  return {
    id: ids.task(`catalyst-${seed.slug}`),
    name: seed.name,
    description: seed.information ?? seed.name,
    information: seed.information ?? seed.name,
    category: seed.category,
    tier: seed.tier,
    priority: seed.tier === 'easy' ? 'Quick Win' : 'Mid',
    points: seed.tier === 'easy' ? 10 : 30,
    locality: seed.locality,
    regionId: MISHTHALIN_ID,
    locationId: seed.locationId,
    requirements,
    recommendedItemIds: requirements.items.map((item) => item.itemId),
    acquisitionSteps: [{ type: 'perform-action', label: seed.information ?? seed.name, locationId: seed.locationId ?? undefined }],
    nearbyTaskIds: [],
    estimatedSeconds: seed.estimatedSeconds ?? null,
    routePolicy: manual ? 'manual-only' : requirements.items.length > 0 ? 'requires-item-owned' : 'normal',
    reviewStatus: seed.review ?? 'verified',
    sources: [catalystTasks],
    completionRate: seed.completionRate,
  };
}

export const misthalinRemainingEasyMediumTasks: TaskDefinition[] = [
  task({ slug: 'misthalin-tutorial-first-relic', name: 'Progress through the Leagues tutorial to unlock your first relic.', locality: 'Misthalin: Lumbridge', tier: 'easy', category: 'exploration', locationId: misthalinLocationIds.lumbridgeCourtyard, completionRate: 1, estimatedSeconds: 60 }),
  task({ slug: 'misthalin-edgeville-mine-coal-gunnarsgrunn', name: 'Mine some coal in the centre of Barbarian Village.', locality: 'Misthalin: Edgeville', tier: 'easy', category: 'skilling', locationId: misthalinLocationIds.gunnarsgrunnMines, skills: [skill('Mining', 20)], completionRate: 0.74, estimatedSeconds: 35 }),
  task({ slug: 'misthalin-fort-use-workshop-bank', name: 'Use the bank in the workshop at Fort Forinthry.', locality: 'Misthalin: Fort Forinthry', tier: 'easy', category: 'exploration', locationId: misthalinExtendedLocationIds.fortForinthry, quests: ['New Foundations (partial)'], completionRate: 0.624, estimatedSeconds: 20 }),
  task({ slug: 'misthalin-lumbridge-kill-goblin', name: 'Kill a goblin in Lumbridge.', locality: 'Misthalin: Lumbridge', tier: 'easy', category: 'combat', locationId: misthalinLocationIds.lumbridgeCourtyard, completionRate: 0.951, estimatedSeconds: 25 }),
  task({ slug: 'misthalin-necromancy-quest', name: 'Complete the quest: Necromancy!', locality: 'Misthalin: Draynor Village', tier: 'easy', category: 'quest', locationId: misthalinExtendedLocationIds.cityOfUm, quests: ['Necromancy!'], completionRate: 0.753, manual: true }),
  task({ slug: 'misthalin-um-upgrade-t20-equipment', name: 'Upgrade a piece of Death Skull or Deathwarden equipment to tier 20.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUm, skills: [skill('Necromancy', 20)], quests: ['Kili Row'], unlocks: ['15 Smithing for Death Skull or 15 Crafting for Deathwarden'], completionRate: 0.383, manual: true }),
  task({ slug: 'misthalin-um-craft-spirit-or-bone-runes', name: 'Craft some spirit or bone runes.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUm, skills: [skill('Runecrafting', 1)], quests: ['Rune Mythos (partial)'], completionRate: 0.361, manual: true }),
  task({ slug: 'misthalin-um-lesser-necroplasm-ritual', name: 'Complete a Lesser Necroplasm ritual.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 5)], completionRate: 0.562, estimatedSeconds: 90 }),
  task({ slug: 'misthalin-um-conjure-skeleton', name: 'Conjure a Skeleton Warrior at the City of Um ritual site.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'combat', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 2)], unlocks: ['Conjure Skeleton Warrior unlocked at the Well of Souls'], completionRate: 0.518 }),
  task({ slug: 'misthalin-um-conjure-zombie', name: 'Conjure a Putrid Zombie at the City of Um ritual site.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'combat', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 40)], unlocks: ['Conjure Putrid Zombie unlocked at the Well of Souls'], completionRate: 0.16 }),
  task({ slug: 'misthalin-um-conjure-ghost', name: 'Conjure a Vengeful Ghost at the City of Um ritual site.', locality: 'Misthalin: City of Um', tier: 'easy', category: 'combat', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 40)], unlocks: ['Conjure Vengeful Ghost unlocked at the Well of Souls'], completionRate: 0.178 }),
  task({ slug: 'misthalin-fort-give-bill-beer', name: 'Give Bill a beer in Fort Forinthry.', locality: 'Misthalin: Fort Forinthry', tier: 'easy', category: 'exploration', locationId: misthalinExtendedLocationIds.fortForinthry, quests: ['New Foundations (partial)'], unlocks: ['Beer'], completionRate: 0.381, manual: true }),
  task({ slug: 'misthalin-fort-make-plank', name: 'Make a plank yourself on the sawmill in Fort Forinthry.', information: 'Make a regular plank from logs at the Fort Forinthry sawmill.', locality: 'Misthalin: Fort Forinthry', tier: 'easy', category: 'skilling', locationId: misthalinExtendedLocationIds.fortForinthry, skills: [skill('Construction', 1)], quests: ['New Foundations (partial)'], unlocks: ['Logs'], completionRate: 0.55, manual: true }),
  task({ slug: 'misthalin-digsite-pan-river', name: 'Pan in the river at the Dig Site.', locality: 'Misthalin: Varrock', tier: 'easy', category: 'exploration', locationId: misthalinExtendedLocationIds.digSitePanning, quests: ['The Dig Site (partial)'], unlocks: ['Panning tray'], completionRate: 0.315, manual: true }),

  task({ slug: 'misthalin-wizards-tower-lesser-demon', name: "Kill the lesser demon in the Wizards' Tower.", information: 'Kill the lesser demon in the Wizards’ Tower; it cannot be attacked with short-range melee.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'combat', locationId: misthalinLocationIds.wizardsTower, completionRate: 0.657, estimatedSeconds: 90 }),
  task({ slug: 'misthalin-runespan-yellow-wizard', name: 'Hunt a yellow wizard in the Runespan and give them some items.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.wizardsTower, skills: [skill('Runecrafting', 1)], completionRate: 0.429, manual: true }),
  task({ slug: 'misthalin-rune-goldberg-vis-wax', name: 'Use the Rune Goldberg Machine to create vis wax.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.wizardsTower, skills: [skill('Runecrafting', 50)], completionRate: 0.346, estimatedSeconds: 60 }),
  task({ slug: 'misthalin-runespan-nature-esshound', name: 'Siphon from a nature esshound in the Runespan.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.wizardsTower, skills: [skill('Runecrafting', 44)], completionRate: 0.463, estimatedSeconds: 90 }),
  task({ slug: 'misthalin-runespan-runesphere', name: 'Siphon rune dust from a Runesphere in the Runespan.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.wizardsTower, skills: [skill('Runecrafting', 1)], completionRate: 0.229, manual: true }),
  task({ slug: 'misthalin-stronghold-player-safety', name: 'Fully complete the Stronghold of Player Safety.', locality: 'Misthalin: Edgeville', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.strongholdOfSecurity, completionRate: 0.439, estimatedSeconds: 300 }),
  task({ slug: 'misthalin-new-foundations-quest', name: 'Complete the quest: New Foundations.', locality: 'Misthalin: Fort Forinthry', tier: 'medium', category: 'quest', locationId: misthalinExtendedLocationIds.fortForinthry, quests: ['New Foundations'], completionRate: 0.504, manual: true }),
  task({ slug: 'misthalin-beginner-lumbridge-achievements', name: 'Complete the task set: Beginner Lumbridge.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.lumbridgeCourtyard, unlocks: ['Beginner Lumbridge achievements'], completionRate: 0.513, manual: true }),
  task({ slug: 'misthalin-duck-quest', name: 'Complete the quest: Duck Quest.', locality: 'Misthalin: Draynor Village', tier: 'medium', category: 'quest', locationId: misthalinLocationIds.draynorVillage, quests: ['Duck Quest'], completionRate: 0.306, manual: true }),
  task({ slug: 'misthalin-easy-lumbridge-achievements', name: 'Complete the task set: Easy Lumbridge.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.lumbridgeCourtyard, unlocks: ['Easy Lumbridge achievements'], completionRate: 0.288, manual: true }),
  task({ slug: 'misthalin-medium-lumbridge-achievements', name: 'Complete the task set: Medium Lumbridge.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.draynorVillage, unlocks: ['Medium Lumbridge achievements'], completionRate: 0.127, manual: true }),
  task({ slug: 'misthalin-tears-of-guthix', name: 'Drink from the Tears of Guthix.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'other', locationId: misthalinLocationIds.lumbridgeSwampMine, quests: ['Tears of Guthix'], completionRate: 0.104, manual: true }),
  task({ slug: 'misthalin-shattered-worlds-25', name: 'Complete world 25 in Shattered Worlds.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'combat', locationId: misthalinExtendedLocationIds.lumbridgeShatteredWorlds, completionRate: 0.236, manual: true }),
  task({ slug: 'misthalin-puro-puro-20-implings', name: 'Catch 20 implings in Puro-Puro.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinExtendedLocationIds.lumbridgePuroPuro, skills: [skill('Hunter', 17)], completionRate: 0.142, estimatedSeconds: 600 }),
  task({ slug: 'misthalin-sheep-shearer-miniquest', name: 'Complete the quest: Sheep Shearer (miniquest).', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'quest', locationId: misthalinLocationIds.lumbridgeCowField, quests: ['Sheep Shearer'], completionRate: 0.658, manual: true }),
  task({ slug: 'misthalin-ham-pickpocket', name: 'Pickpocket a H.A.M. member.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinExtendedLocationIds.lumbridgeHamHideout, skills: [skill('Thieving', 15)], completionRate: 0.681, estimatedSeconds: 30 }),
  task({ slug: 'misthalin-churn-butter', name: 'Churn some butter.', information: 'Make a pat of butter by using a bucket of milk at a dairy churn.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.lumbridgeCowField, skills: [skill('Cooking', 38)], unlocks: ['Bucket of milk'], completionRate: 0.382, estimatedSeconds: 40 }),
  task({ slug: 'misthalin-craft-50-cosmic-runes', name: 'Craft 50 cosmic runes.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.lumbridgeSwampMine, skills: [skill('Runecrafting', 27)], quests: ['Lost City'], unlocks: ['Cosmic talisman or equivalent', 'Rune essence'], completionRate: 0.22, manual: true }),
  task({ slug: 'misthalin-steal-cave-goblin-lantern', name: 'Steal a lantern from a cave goblin.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.lumbridgeSwampMine, skills: [skill('Thieving', 36)], quests: ['Death to the Dorgeshuun'], completionRate: 0.03, manual: true }),
  task({ slug: 'misthalin-lumbridge-range-cake', name: 'Use the range in Lumbridge Castle to bake a cake.', locality: 'Misthalin: Lumbridge', tier: 'medium', category: 'skilling', locationId: misthalinLocationIds.lumbridgeCastle, skills: [skill('Cooking', 40)], quests: ["Cook's Assistant"], completionRate: 0.323, manual: true }),
  task({ slug: 'misthalin-um-matching-conjure', name: 'Have either a Putrid Zombie or Vengeful Ghost conjured while fighting the matching creature.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'combat', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 40)], unlocks: ['Tier 3 conjure talents', 'Conduit', 'Ectoplasm'], completionRate: 0.189, manual: true }),
  task({ slug: 'misthalin-um-moonstone-jewellery', name: 'Learn how to craft moonstone jewellery.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUm, skills: [skill('Necromancy', 50)], unlocks: ['Brown apron or keepsaked override'], completionRate: 0.109, manual: true }),
  task({ slug: 'misthalin-um-bedsheet', name: 'Disgruntle an inhabitant of Um by wearing a bedsheet.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'exploration', locationId: misthalinExtendedLocationIds.cityOfUm, quests: ['Ghosts Ahoy'], unlocks: ['Bedsheet'], completionRate: 0.085, manual: true }),
  task({ slug: 'misthalin-um-upgrade-t50-equipment', name: 'Upgrade a piece of Death Skull or Deathwarden equipment to tier 50.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUm, skills: [skill('Necromancy', 20)], quests: ['Necromancy!', 'Kili Row'], unlocks: ["Kili's Knowledge III"], completionRate: 0.23, manual: true }),
  task({ slug: 'misthalin-um-communion-memento', name: 'Complete a communion ritual using a memento.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'skilling', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 5)], quests: ['Necromancy!'], unlocks: ['Memento'], completionRate: 0.391, manual: true }),
  task({ slug: 'misthalin-um-phantom-guardian', name: 'Conjure a Phantom Guardian at the City of Um ritual site.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'combat', locationId: misthalinExtendedLocationIds.cityOfUmRitualSite, skills: [skill('Necromancy', 70)], unlocks: ['Conjure Phantom Guardian unlocked from the Well of Souls'], completionRate: 0.106 }),
  task({ slug: 'misthalin-easy-underworld-achievements', name: 'Complete the task set: Easy Underworld.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'exploration', locationId: misthalinExtendedLocationIds.cityOfUm, unlocks: ['Easy Underworld achievements'], completionRate: 0.296, manual: true }),
  task({ slug: 'misthalin-medium-underworld-achievements', name: 'Complete the task set: Medium Underworld.', locality: 'Misthalin: City of Um', tier: 'medium', category: 'exploration', locationId: misthalinExtendedLocationIds.cityOfUm, unlocks: ['Medium Underworld achievements'], completionRate: 0.118, manual: true }),
  task({ slug: 'misthalin-easy-varrock-achievements', name: 'Complete the task set: Easy Varrock.', locality: 'Misthalin: Varrock', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.varrockCenter, unlocks: ['Easy Varrock achievements'], completionRate: 0.082, manual: true }),
  task({ slug: 'misthalin-medium-varrock-achievements', name: 'Complete the task set: Medium Varrock.', locality: 'Misthalin: Varrock', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.varrockCenter, unlocks: ['Medium Varrock achievements'], completionRate: 0.003, manual: true }),
  task({ slug: 'misthalin-oziach-armour-shop', name: "Browse through Oziach's Armour Shop.", locality: 'Misthalin: Edgeville', tier: 'medium', category: 'exploration', locationId: misthalinLocationIds.edgevilleCenter, quests: ['Dragon Slayer'], completionRate: 0.316, manual: true }),
  task({ slug: 'misthalin-enter-cooks-guild', name: "Enter the Cooks' Guild.", locality: 'Misthalin: Varrock', tier: 'medium', category: 'exploration', locationId: misthalinExtendedLocationIds.cooksGuild, skills: [skill('Cooking', 32)], unlocks: ["Chef's hat or equivalent"], completionRate: 0.53, estimatedSeconds: 25 }),
  task({ slug: 'misthalin-demon-slayer-quest', name: 'Complete the quest: Demon Slayer.', locality: 'Misthalin: Varrock', tier: 'medium', category: 'quest', locationId: misthalinLocationIds.varrockCenter, quests: ['Demon Slayer'], completionRate: 0.481, manual: true }),
  task({ slug: 'misthalin-vampyre-slayer-quest', name: 'Complete the quest: Vampyre Slayer.', locality: 'Misthalin: Varrock', tier: 'medium', category: 'quest', locationId: misthalinLocationIds.varrockCenter, quests: ['Vampyre Slayer'], completionRate: 0.517, manual: true }),
];
