/* Registry for region/world progression datasets.
 * New regions register data only; the engine and planner stay unchanged.
 */
(function initRegionRegistry(global) {
  'use strict';

  const regions = new Map();

  function validate(dataset) {
    if (!dataset?.id) throw new Error('Region datasets require an id.');
    if (!dataset?.name) throw new Error(`Region dataset ${dataset.id} requires a name.`);
    if (!Array.isArray(dataset.nodes)) throw new Error(`Region dataset ${dataset.id} requires nodes.`);
    return dataset;
  }

  function register(dataset) {
    validate(dataset);
    regions.set(dataset.id, Object.freeze({ ...dataset, nodes: Object.freeze([...dataset.nodes]) }));
    global.dispatchEvent(new CustomEvent('rs3:region-registered', { detail: { regionId: dataset.id } }));
    return dataset;
  }

  function get(regionId) {
    return regions.get(regionId) || null;
  }

  function list() {
    return [...regions.values()];
  }

  function createEngine(regionIds = null) {
    const datasets = regionIds
      ? regionIds.map(get).filter(Boolean)
      : list();
    return new global.RS3DependencyEngine(datasets);
  }

  global.RS3RegionRegistry = { register, get, list, createEngine };
})(window);
