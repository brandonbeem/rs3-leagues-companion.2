/* Generic progression dependency engine for quests, buildings, bosses, achievements,
 * equipment acquisition, and future world models.
 */
(function initDependencyEngine(global) {
  const asSet = value => value instanceof Set ? value : new Set(value || []);
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  class DependencyEngine {
    constructor(datasets = []) {
      this.nodes = new Map();
      datasets.forEach(dataset => this.register(dataset));
    }

    register(dataset) {
      for (const node of dataset?.nodes || []) {
        if (!node?.id) throw new Error('Dependency nodes require a unique id.');
        if (this.nodes.has(node.id)) throw new Error(`Duplicate dependency node: ${node.id}`);
        this.nodes.set(node.id, Object.freeze({ ...node }));
      }
      return this;
    }

    get(id) {
      return this.nodes.get(id) || null;
    }

    requirementsFor(nodeOrId) {
      const node = typeof nodeOrId === 'string' ? this.get(nodeOrId) : nodeOrId;
      if (!node) return { quests: [], nodes: [], skills: {}, materials: [] };
      const explicit = node.requirements || {};
      return {
        quests: [...(explicit.quests || [])],
        nodes: [...(explicit.nodes || node.requires || [])],
        skills: { ...(explicit.skills || {}) },
        materials: [...(explicit.materials || [])]
      };
    }

    evaluate(nodeOrId, player = {}) {
      const node = typeof nodeOrId === 'string' ? this.get(nodeOrId) : nodeOrId;
      if (!node) return { eligible: false, missing: [{ type: 'node', id: String(nodeOrId), reason: 'Unknown node' }] };

      const completed = asSet(player.completed);
      const quests = asSet(player.quests || player.completed);
      const levels = player.levels || {};
      const inventory = player.inventory || {};
      const req = this.requirementsFor(node);
      const missing = [];

      req.quests.forEach(id => {
        if (!quests.has(id) && !completed.has(id)) missing.push({ type: 'quest', id, node: this.get(id) });
      });
      req.nodes.forEach(id => {
        if (!completed.has(id)) missing.push({ type: 'node', id, node: this.get(id) });
      });
      Object.entries(req.skills).forEach(([skill, level]) => {
        const current = number(levels[skill]);
        if (current < level) missing.push({ type: 'skill', skill, required: level, current });
      });
      req.materials.forEach(material => {
        const current = number(inventory[material.id] ?? inventory[material.name]);
        if (current < material.quantity) {
          missing.push({
            type: 'material', id: material.id, name: material.name,
            required: material.quantity, current, shortfall: material.quantity - current
          });
        }
      });

      return {
        id: node.id,
        node,
        eligible: missing.length === 0 && !completed.has(node.id),
        completed: completed.has(node.id),
        missing,
        unlocks: [...(node.unlocks || [])]
      };
    }

    available(player = {}, predicate = null) {
      return [...this.nodes.values()]
        .filter(node => !predicate || predicate(node))
        .map(node => this.evaluate(node, player))
        .filter(result => result.eligible);
    }

    blocked(player = {}, predicate = null) {
      return [...this.nodes.values()]
        .filter(node => !predicate || predicate(node))
        .map(node => this.evaluate(node, player))
        .filter(result => !result.completed && !result.eligible);
    }

    nextSteps(player = {}, options = {}) {
      const limit = Number(options.limit) || 10;
      const typeWeights = options.typeWeights || {
        quest: 100, 'fort-building': 80, boss: 60, achievement: 40, equipment: 30
      };
      const score = result => {
        const node = result.node;
        const unlockValue = (node.unlocks || []).length * 10;
        const tierValue = node.tier ? Math.max(0, 4 - node.tier) * 2 : 0;
        return (typeWeights[node.type] || 0) + unlockValue + tierValue;
      };
      return this.available(player, options.predicate)
        .sort((a, b) => score(b) - score(a) || a.node.name.localeCompare(b.node.name))
        .slice(0, limit);
    }

    materialShortfalls(nodeOrId, player = {}) {
      return this.evaluate(nodeOrId, player).missing.filter(item => item.type === 'material');
    }

    explain(nodeOrId, player = {}) {
      const result = this.evaluate(nodeOrId, player);
      if (result.completed) return `${result.node.name} is complete.`;
      if (result.eligible) return `${result.node.name} is ready.`;
      return result.missing.map(item => {
        if (item.type === 'skill') return `${item.skill} ${item.required} (current ${item.current})`;
        if (item.type === 'material') return `${item.shortfall} more ${item.name}`;
        return item.node?.name || item.id;
      }).join(', ');
    }
  }

  global.RS3DependencyEngine = DependencyEngine;
  global.RS3Dependencies = global.RS3Dependencies || {};
  global.RS3Dependencies.createFortEngine = function createFortEngine() {
    if (!global.RS3_FORT_FORINTHRY_DATA) throw new Error('Load fort-forinthry-data.js before creating the Fort engine.');
    return new DependencyEngine([global.RS3_FORT_FORINTHRY_DATA]);
  };
})(window);
