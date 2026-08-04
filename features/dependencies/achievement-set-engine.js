/* Reusable achievement-set checklist engine.
 * A set groups individual achievement nodes while the dependency engine
 * continues to evaluate each achievement's quest, skill, node, and material requirements.
 */
(function initAchievementSetEngine(global) {
  'use strict';

  const asSet = value => value instanceof Set ? value : new Set(value || []);

  class AchievementSetEngine {
    constructor(dependencyEngine, datasets = []) {
      if (!dependencyEngine) throw new Error('AchievementSetEngine requires a dependency engine.');
      this.dependencyEngine = dependencyEngine;
      this.sets = new Map();
      datasets.forEach(dataset => this.registerDataset(dataset));
    }

    registerDataset(dataset) {
      for (const set of dataset?.achievementSets || []) this.registerSet(set);
      return this;
    }

    registerSet(set) {
      if (!set?.id) throw new Error('Achievement sets require an id.');
      if (!set?.name) throw new Error(`Achievement set ${set.id} requires a name.`);
      if (!Array.isArray(set.achievementIds)) throw new Error(`Achievement set ${set.id} requires achievementIds.`);
      if (this.sets.has(set.id)) throw new Error(`Duplicate achievement set: ${set.id}`);
      for (const id of set.achievementIds) {
        if (!this.dependencyEngine.get(id)) throw new Error(`Achievement set ${set.id} references unknown node: ${id}`);
      }
      this.sets.set(set.id, Object.freeze({ ...set, achievementIds: Object.freeze([...set.achievementIds]) }));
      return set;
    }

    get(setId) {
      return this.sets.get(setId) || null;
    }

    list() {
      return [...this.sets.values()];
    }

    evaluate(setOrId, player = {}) {
      const set = typeof setOrId === 'string' ? this.get(setOrId) : setOrId;
      if (!set) return null;
      const completed = asSet([...(player.completed || []), ...(player.quests || [])]);
      const items = set.achievementIds.map(id => {
        const result = this.dependencyEngine.evaluate(id, player);
        return {
          id,
          node: result.node,
          completed: completed.has(id),
          eligible: result.eligible,
          missing: result.missing,
          unlocks: result.unlocks
        };
      });
      const completedCount = items.filter(item => item.completed).length;
      const readyCount = items.filter(item => !item.completed && item.eligible).length;
      return {
        set,
        items,
        total: items.length,
        completedCount,
        remainingCount: items.length - completedCount,
        readyCount,
        percent: items.length ? Math.round((completedCount / items.length) * 100) : 0,
        completed: items.length > 0 && completedCount === items.length,
        next: items.filter(item => !item.completed && item.eligible),
        blocked: items.filter(item => !item.completed && !item.eligible)
      };
    }

    summaries(player = {}) {
      return this.list().map(set => this.evaluate(set, player));
    }
  }

  global.RS3AchievementSetEngine = AchievementSetEngine;
})(window);
