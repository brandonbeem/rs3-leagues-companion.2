/* Initial City of Um progression-area model.
 * City of Um is a locality within the Misthalin League region.
 */
(function initCityOfUmData(global) {
  'use strict';

  const node = (id, type, name, requirements = {}, unlocks = [], extra = {}) => ({
    id,
    type,
    name,
    region: 'Misthalin',
    locality: 'City of Um',
    requirements,
    unlocks,
    ...extra
  });

  const nodes = [
    node('um-quest-necromancy', 'quest', 'Necromancy!', {}, [
      'um-ritual-communion', 'um-quest-kili-row', 'um-quest-rune-mythos', 'um-quest-spirit-of-war'
    ]),
    node('um-quest-kili-row', 'quest', 'Kili Row', {
      quests: ['um-quest-necromancy']
    }, ['um-equipment-tier-20', 'um-equipment-tier-50']),
    node('um-quest-rune-mythos', 'quest', 'Rune Mythos', {
      quests: ['um-quest-necromancy']
    }, ['um-runes-spirit-bone']),
    node('um-quest-spirit-of-war', 'quest', 'The Spirit of War', {
      quests: ['um-quest-necromancy']
    }, ['um-boss-hermod']),
    node('um-quest-that-old-black-magic', 'quest', 'That Old Black Magic', {
      quests: ['um-quest-necromancy']
    }, ['um-dead-beats-rest']),
    node('um-quest-soul-searching', 'quest', 'Soul Searching', {
      quests: ['um-quest-necromancy']
    }, ['um-boss-nakatra', 'um-gate-of-elidinis']),
    node('um-quest-ode-of-the-devourer', 'quest', 'Ode of the Devourer', {
      quests: ['um-quest-soul-searching']
    }, ['um-gate-of-elidinis']),
    node('um-quest-alpha-vs-omega', 'quest', 'Alpha vs Omega', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 95 }
    }, ['um-boss-rasial', 'um-equip-omni-guard', 'um-equip-soulbound-lantern', 'um-equip-first-necromancer-robes']),

    node('um-ritual-lesser-necroplasm', 'ritual', 'Complete a Lesser Necroplasm ritual', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 5 }
    }),
    node('um-ritual-communion', 'ritual', 'Complete a communion ritual using a memento', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 5 }
    }),
    node('um-runes-spirit-bone', 'skilling', 'Craft spirit or bone runes', {
      quests: ['um-quest-rune-mythos'],
      skills: { Runecrafting: 1 }
    }),

    node('um-conjure-skeleton', 'ability', 'Conjure a Skeleton Warrior', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 2 }
    }),
    node('um-conjure-zombie', 'ability', 'Conjure a Putrid Zombie', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 40 }
    }),
    node('um-conjure-ghost', 'ability', 'Conjure a Vengeful Ghost', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 40 }
    }),
    node('um-conjure-phantom', 'ability', 'Conjure a Phantom Guardian', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 70 }
    }),
    node('um-conjure-undead-army', 'ability', 'Conjure an undead army', {
      quests: ['um-quest-necromancy'],
      skills: { Necromancy: 99 }
    }),

    node('um-achievements-easy', 'achievement', 'Complete the Easy Underworld achievements', {
      quests: ['um-quest-necromancy']
    }, ['um-achievements-medium']),
    node('um-achievements-medium', 'achievement', 'Complete the Medium Underworld achievements', {
      nodes: ['um-achievements-easy']
    }, ['um-achievements-hard']),
    node('um-achievements-hard', 'achievement', 'Complete the Hard Underworld achievements', {
      nodes: ['um-achievements-medium']
    }),

    node('um-equipment-tier-20', 'equipment', 'Upgrade Death Skull or Deathwarden equipment to tier 20', {
      quests: ['um-quest-kili-row'],
      skills: { Necromancy: 20 }
    }),
    node('um-equipment-tier-50', 'equipment', 'Upgrade Death Skull or Deathwarden equipment to tier 50', {
      quests: ['um-quest-kili-row'],
      skills: { Necromancy: 50 }
    }),
    node('um-equip-omni-guard', 'equipment', 'Equip an Omni guard', {
      quests: ['um-quest-alpha-vs-omega'],
      skills: { Necromancy: 95 }
    }),
    node('um-equip-soulbound-lantern', 'equipment', 'Equip a Soulbound lantern', {
      quests: ['um-quest-alpha-vs-omega'],
      skills: { Necromancy: 95 }
    }),
    node('um-equip-first-necromancer-robes', 'equipment', 'Equip the Robes of the First Necromancer', {
      quests: ['um-quest-alpha-vs-omega'],
      skills: { Necromancy: 95, Defence: 95 }
    }),

    node('um-boss-hermod', 'boss', 'Defeat Hermod, the Spirit of War', {
      quests: ['um-quest-spirit-of-war']
    }),
    node('um-boss-nakatra', 'boss', 'Defeat Nakatra, Devourer Eternal', {
      quests: ['um-quest-soul-searching']
    }),
    node('um-gate-of-elidinis', 'boss', 'Cleanse the Gate of Elidinis', {
      quests: ['um-quest-soul-searching']
    }),
    node('um-boss-rasial', 'boss', 'Defeat Rasial, the First Necromancer', {
      quests: ['um-quest-alpha-vs-omega'],
      skills: { Necromancy: 95 }
    }),

    node('um-dead-beats-rest', 'interaction', 'Rest while listening to the Dead Beats', {
      quests: ['um-quest-that-old-black-magic']
    })
  ];

  global.RS3_CITY_OF_UM_DATA = Object.freeze({
    id: 'city-of-um',
    version: 1,
    modelStatus: 'initial',
    nodes: Object.freeze(nodes)
  });
})(window);
