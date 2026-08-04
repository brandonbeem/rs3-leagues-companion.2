/* Fort Forinthry progression data.
 * Data-only by design so the same dependency engine can power City of Um,
 * achievement sets, bosses, and equipment trees later.
 */
(function initFortForinthryData(global) {
  const q = (id, name, requires = [], unlocks = []) => ({
    id, type: 'quest', name, region: 'Misthalin', locality: 'Fort Forinthry',
    requires, unlocks
  });

  const b = (id, name, tier, construction, frames, frameType, questRequires = [], previousTier = null, unlocks = []) => ({
    id, type: 'fort-building', name, tier, region: 'Misthalin', locality: 'Fort Forinthry',
    requirements: {
      quests: questRequires,
      nodes: previousTier ? [previousTier] : [],
      skills: { Construction: construction },
      materials: [
        { id: frameType.toLowerCase().replace(/\s+/g, '-'), name: frameType, quantity: frames },
        { id: 'stone-wall-segment', name: 'Stone wall segment', quantity: 6 }
      ]
    },
    unlocks
  });

  const nodes = [
    q('quest-new-foundations', 'New Foundations', [], [
      'fort-workshop-1', 'fort-town-hall-1', 'fort-chapel-1', 'fort-command-centre-1'
    ]),
    q('quest-murder-on-the-border', 'Murder on the Border', [
      'quest-new-foundations', 'fort-workshop-1', 'fort-town-hall-1', 'fort-chapel-1', 'fort-command-centre-1'
    ], ['fort-kitchen-1', 'quest-unwelcome-guests']),
    q('quest-unwelcome-guests', 'Unwelcome Guests', ['quest-murder-on-the-border'], [
      'fort-guardhouse-1', 'quest-dead-and-buried'
    ]),
    q('quest-dead-and-buried', 'Dead and Buried', ['quest-unwelcome-guests'], [
      'fort-grove-1', 'quest-ancient-awakening'
    ]),
    q('quest-ancient-awakening', 'Ancient Awakening', ['quest-dead-and-buried'], [
      'fort-botanists-workbench-1', 'boss-zemouregal-vorkath'
    ]),

    b('fort-workshop-1', 'Workshop', 1, 1, 8, 'Wooden frame', ['quest-new-foundations'], null, ['fort-blueprints', 'fort-construction-training']),
    b('fort-workshop-2', 'Workshop', 2, 35, 20, 'Teak frame', ['quest-new-foundations'], 'fort-workshop-1'),
    b('fort-workshop-3', 'Workshop', 3, 75, 48, 'Yew frame', ['quest-new-foundations'], 'fort-workshop-2', ['achievement-fort-experiment']),

    b('fort-town-hall-1', 'Town Hall', 1, 10, 10, 'Oak frame', ['quest-new-foundations'], null, ['fort-rested-xp']),
    b('fort-town-hall-2', 'Town Hall', 2, 45, 20, 'Teak frame', ['quest-new-foundations'], 'fort-town-hall-1'),
    b('fort-town-hall-3', 'Town Hall', 3, 80, 60, 'Magic frame', ['quest-new-foundations'], 'fort-town-hall-2', ['achievement-forty-winks']),

    b('fort-chapel-1', 'Chapel', 1, 15, 10, 'Oak frame', ['quest-new-foundations'], null, ['fort-prayer-altar']),
    b('fort-chapel-2', 'Chapel', 2, 55, 24, 'Acadia frame', ['quest-new-foundations'], 'fort-chapel-1'),
    b('fort-chapel-3', 'Chapel', 3, 90, 50, 'Elder frame', ['quest-new-foundations'], 'fort-chapel-2', ['achievement-spiritual-comfort', 'fort-prayer-book-swap']),

    b('fort-command-centre-1', 'Command Centre', 1, 25, 12, 'Willow frame', ['quest-new-foundations'], null, ['fort-global-operations']),
    b('fort-command-centre-2', 'Command Centre', 2, 70, 26, 'Yew frame', ['quest-new-foundations'], 'fort-command-centre-1'),
    b('fort-command-centre-3', 'Command Centre', 3, 99, 80, 'Elder frame', ['quest-new-foundations'], 'fort-command-centre-2', ['achievement-managing-your-fortune']),

    b('fort-kitchen-1', 'Kitchen', 1, 25, 12, 'Willow frame', ['quest-murder-on-the-border'], null, ['fort-kitchen-range']),
    b('fort-kitchen-2', 'Kitchen', 2, 50, 22, 'Acadia frame', ['quest-murder-on-the-border'], 'fort-kitchen-1'),
    b('fort-kitchen-3', 'Kitchen', 3, 85, 50, 'Magic frame', ['quest-murder-on-the-border'], 'fort-kitchen-2', ['achievement-fort-fullness']),

    b('fort-guardhouse-1', 'Guardhouse', 1, 40, 14, 'Maple frame', ['quest-unwelcome-guests'], null, ['fort-raptor-slayer']),
    b('fort-guardhouse-2', 'Guardhouse', 2, 65, 26, 'Mahogany frame', ['quest-unwelcome-guests'], 'fort-guardhouse-1'),
    b('fort-guardhouse-3', 'Guardhouse', 3, 95, 70, 'Elder frame', ['quest-unwelcome-guests'], 'fort-guardhouse-2', ['achievement-fortified']),

    b('fort-grove-1', 'Grove Cabin', 1, 45, 18, 'Teak frame', ['quest-dead-and-buried'], null, ['fort-grove']),
    b('fort-grove-2', 'Grove Cabin', 2, 50, 22, 'Acadia frame', ['quest-dead-and-buried'], 'fort-grove-1'),
    b('fort-grove-3', 'Grove Cabin', 3, 60, 48, 'Mahogany frame', ['quest-dead-and-buried'], 'fort-grove-2', ['achievement-lack-of-forefort']),

    b('fort-botanists-workbench-1', "Botanist's Workbench", 1, 54, 4, 'Acadia frame', ['quest-ancient-awakening'], null, ['fort-herblore-services']),
    b('fort-botanists-workbench-2', "Botanist's Workbench", 2, 78, 8, 'Yew frame', ['quest-ancient-awakening'], 'fort-botanists-workbench-1'),
    b('fort-botanists-workbench-3', "Botanist's Workbench", 3, 92, 12, 'Elder frame', ['quest-ancient-awakening'], 'fort-botanists-workbench-2', ['achievement-botany-more']),

    {
      id: 'boss-zemouregal-vorkath', type: 'boss', name: 'Zemouregal & Vorkath', region: 'Misthalin', locality: 'Fort Forinthry',
      requirements: {
        quests: ['quest-ancient-awakening'],
        nodes: ['fort-grove-1', 'fort-botanists-workbench-1'],
        skills: { Necromancy: 60 },
        materials: []
      },
      unlocks: ['fort-vorkath-arena']
    }
  ];

  global.RS3_FORT_FORINTHRY_DATA = Object.freeze({
    id: 'fort-forinthry',
    version: 1,
    nodes: Object.freeze(nodes)
  });
})(window);
