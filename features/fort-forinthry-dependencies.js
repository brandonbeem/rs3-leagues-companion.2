(() => {
  'use strict';

  const STORAGE_KEY = 'rs3lc.fortForinthry.progress.v1';
  const EVENT_NAME = 'rs3lc:fort-progress-changed';

  const node = (id, name, type, requires = [], extra = {}) => ({
    id,
    name,
    type,
    requires,
    region: 'Misthalin',
    area: 'Fort Forinthry',
    ...extra,
  });

  const NODES = [
    node('fort.quest.new_foundations', 'New Foundations', 'quest'),
    node('fort.building.workshop.1', 'Workshop — Tier 1', 'building', ['fort.quest.new_foundations'], { constructionLevel: 1, materials: { wooden_frame: 8, stone_wall_segment: 6 } }),
    node('fort.building.town_hall.1', 'Town Hall — Tier 1', 'building', ['fort.quest.new_foundations', 'fort.building.workshop.1'], { constructionLevel: 10, materials: { oak_frame: 10, stone_wall_segment: 6 } }),
    node('fort.building.chapel.1', 'Chapel — Tier 1', 'building', ['fort.quest.new_foundations', 'fort.building.workshop.1'], { constructionLevel: 15, materials: { oak_frame: 10, stone_wall_segment: 6 } }),
    node('fort.building.command_centre.1', 'Command Centre — Tier 1', 'building', ['fort.quest.new_foundations', 'fort.building.workshop.1'], { constructionLevel: 25, materials: { willow_frame: 12, stone_wall_segment: 6 } }),

    node('fort.quest.murder_on_the_border', 'Murder on the Border', 'quest', [
      'fort.quest.new_foundations',
      'fort.building.workshop.1',
      'fort.building.town_hall.1',
      'fort.building.chapel.1',
      'fort.building.command_centre.1',
    ]),
    node('fort.building.kitchen.1', 'Kitchen — Tier 1', 'building', ['fort.quest.murder_on_the_border'], { constructionLevel: 25, materials: { willow_frame: 12, stone_wall_segment: 6 } }),
    node('fort.building.kitchen.2', 'Kitchen — Tier 2', 'building', ['fort.quest.murder_on_the_border', 'fort.building.kitchen.1'], { constructionLevel: 50, materials: { acadia_frame: 22, stone_wall_segment: 6 } }),
    node('fort.building.kitchen.3', 'Kitchen — Tier 3', 'building', ['fort.building.kitchen.2'], { constructionLevel: 85, materials: { magic_frame: 50, stone_wall_segment: 6 } }),

    node('fort.quest.unwelcome_guests', 'Unwelcome Guests', 'quest', ['fort.quest.murder_on_the_border'], { skillRequirements: { construction: 50, slayer: 10 } }),
    node('fort.building.guardhouse.1', 'Guardhouse — Tier 1', 'building', ['fort.quest.unwelcome_guests'], { constructionLevel: 40, materials: { maple_frame: 14, stone_wall_segment: 6 } }),
    node('fort.building.guardhouse.2', 'Guardhouse — Tier 2', 'building', ['fort.quest.unwelcome_guests', 'fort.building.guardhouse.1'], { constructionLevel: 70 }),
    node('fort.building.guardhouse.3', 'Guardhouse — Tier 3', 'building', ['fort.building.guardhouse.2'], { constructionLevel: 90 }),
    node('fort.fortification.eastern_border_wall', 'Eastern Border Wall', 'fortification', ['fort.quest.unwelcome_guests'], { constructionLevel: 1, materials: { stone_wall_segment: 6, logs: 6 } }),
    node('fort.building.grove.1', "Woodcutters' Grove — Tier 1", 'building', ['fort.quest.unwelcome_guests', 'fort.fortification.eastern_border_wall'], { constructionLevel: 50, materials: { wooden_frame: 8, stone_wall_segment: 6 } }),
    node('fort.building.grove.2', "Woodcutters' Grove — Tier 2", 'building', ['fort.building.grove.1'], { constructionLevel: 50, materials: { teak_frame: 20, stone_wall_segment: 6 } }),
    node('fort.building.grove.3', "Woodcutters' Grove — Tier 3", 'building', ['fort.building.grove.2'], { constructionLevel: 80 }),

    node('fort.quest.dead_and_buried', 'Dead and Buried', 'quest', ['fort.quest.unwelcome_guests']),
    node('fort.quest.ancient_awakening', 'Ancient Awakening', 'quest', ['fort.quest.dead_and_buried']),
    node('fort.building.botanist_workbench.1', "Botanist's Workbench — Tier 1", 'building', ['fort.quest.ancient_awakening'], { constructionLevel: 54, materials: { acadia_frame: 4, stone_wall_segment: 6 } }),
    node('fort.building.botanist_workbench.2', "Botanist's Workbench — Tier 2", 'building', ['fort.building.botanist_workbench.1'], { constructionLevel: 78, materials: { yew_frame: 8, stone_wall_segment: 6 } }),
    node('fort.building.botanist_workbench.3', "Botanist's Workbench — Tier 3", 'building', ['fort.building.botanist_workbench.2'], { constructionLevel: 92, materials: { elder_frame: 12, stone_wall_segment: 6 } }),

    node('fort.quest.battle_of_forinthry', 'Battle of Forinthry', 'quest', [
      'fort.quest.ancient_awakening',
      'fort.building.grove.1',
      'fort.building.botanist_workbench.1',
    ], { skillRequirements: { necromancy: 60 } }),
    node('fort.boss.zemouregal_and_vorkath', 'Zemouregal & Vorkath', 'boss', ['fort.quest.battle_of_forinthry']),
  ];

  const NODE_MAP = Object.fromEntries(NODES.map((entry) => [entry.id, entry]));

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id) => NODE_MAP[id]) : [],
        inventory: parsed.inventory && typeof parsed.inventory === 'object' ? parsed.inventory : {},
        skills: parsed.skills && typeof parsed.skills === 'object' ? parsed.skills : {},
      };
    } catch (_error) {
      return { completed: [], inventory: {}, skills: {} };
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getSnapshot(progress) }));
  }

  function missingRequirements(entry, progress = loadProgress()) {
    const completed = new Set(progress.completed);
    const missingNodes = entry.requires.filter((id) => !completed.has(id));
    const missingSkills = Object.entries(entry.skillRequirements || {})
      .filter(([skill, level]) => Number(progress.skills[skill] || 0) < level)
      .map(([skill, level]) => ({ skill, level, current: Number(progress.skills[skill] || 0) }));
    const missingMaterials = Object.entries(entry.materials || {})
      .map(([material, amount]) => ({ material, amount, current: Number(progress.inventory[material] || 0) }))
      .filter(({ amount, current }) => current < amount);
    return { missingNodes, missingSkills, missingMaterials };
  }

  function isUnlocked(entry, progress = loadProgress()) {
    const missing = missingRequirements(entry, progress);
    return missing.missingNodes.length === 0 && missing.missingSkills.length === 0;
  }

  function getSnapshot(progress = loadProgress()) {
    const completed = new Set(progress.completed);
    const entries = NODES.map((entry) => {
      const missing = missingRequirements(entry, progress);
      return {
        ...entry,
        completed: completed.has(entry.id),
        unlocked: isUnlocked(entry, progress),
        missing,
      };
    });
    return {
      progress,
      entries,
      completed: entries.filter((entry) => entry.completed),
      available: entries.filter((entry) => !entry.completed && entry.unlocked),
      blocked: entries.filter((entry) => !entry.completed && !entry.unlocked),
    };
  }

  function setCompleted(id, value = true) {
    if (!NODE_MAP[id]) throw new Error(`Unknown Fort Forinthry node: ${id}`);
    const progress = loadProgress();
    const completed = new Set(progress.completed);
    value ? completed.add(id) : completed.delete(id);
    progress.completed = [...completed];
    saveProgress(progress);
    return getSnapshot(progress);
  }

  function setSkill(skill, level) {
    const progress = loadProgress();
    progress.skills[String(skill).toLowerCase()] = Math.max(0, Number(level) || 0);
    saveProgress(progress);
    return getSnapshot(progress);
  }

  function setInventory(material, amount) {
    const progress = loadProgress();
    progress.inventory[String(material).toLowerCase()] = Math.max(0, Number(amount) || 0);
    saveProgress(progress);
    return getSnapshot(progress);
  }

  function getOptimizerGoals(progress = loadProgress()) {
    return getSnapshot(progress).entries
      .filter((entry) => !entry.completed)
      .map((entry) => {
        const missing = missingRequirements(entry, progress);
        const dependencyDepth = missing.missingNodes.length;
        const materialGap = missing.missingMaterials.reduce((sum, item) => sum + Math.max(0, item.amount - item.current), 0);
        return {
          id: entry.id,
          title: entry.name,
          category: 'Fort Forinthry',
          type: entry.type,
          ready: isUnlocked(entry, progress),
          blockers: missing,
          priorityScore: (isUnlocked(entry, progress) ? 1000 : 0) - (dependencyDepth * 100) - materialGap,
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }

  window.RS3Leagues = window.RS3Leagues || {};
  window.RS3Leagues.fortForinthry = Object.freeze({
    version: '1.0.0',
    storageKey: STORAGE_KEY,
    eventName: EVENT_NAME,
    nodes: NODES,
    getNode: (id) => NODE_MAP[id] || null,
    loadProgress,
    getSnapshot,
    getOptimizerGoals,
    setCompleted,
    setSkill,
    setInventory,
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getSnapshot() }));
      return getSnapshot();
    },
  });

  window.dispatchEvent(new CustomEvent('rs3lc:feature-ready', {
    detail: { feature: 'fort-forinthry-dependencies', version: '1.0.0' },
  }));
})();