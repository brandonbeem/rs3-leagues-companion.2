/* Registry for progression areas within Leagues regions.
 * Examples: Fort Forinthry is an area in Misthalin; City of Um is a town within its parent region.
 * New areas register data only; the dependency engine and planner stay unchanged.
 */
(function initRegionRegistry(global) {
  'use strict';

  const areas = new Map();

  function validate(dataset) {
    if (!dataset?.id) throw new Error('Progression-area datasets require an id.');
    if (!dataset?.name) throw new Error(`Progression area ${dataset.id} requires a name.`);
    if (!dataset?.parentRegion) throw new Error(`Progression area ${dataset.id} requires parentRegion.`);
    if (!Array.isArray(dataset.nodes)) throw new Error(`Progression area ${dataset.id} requires nodes.`);
    if (areas.has(dataset.id)) throw new Error(`Duplicate progression area: ${dataset.id}`);
    return dataset;
  }

  function register(dataset) {
    validate(dataset);
    const normalized = Object.freeze({
      areaType: 'locality',
      ...dataset,
      nodes: Object.freeze([...dataset.nodes])
    });
    areas.set(normalized.id, normalized);
    global.dispatchEvent(new CustomEvent('rs3:region-registered', {
      detail: { areaId: normalized.id, parentRegion: normalized.parentRegion }
    }));
    return normalized;
  }

  function get(areaId) {
    return areas.get(areaId) || null;
  }

  function list() {
    return [...areas.values()];
  }

  function listByRegion(parentRegion) {
    return list().filter(area => area.parentRegion === parentRegion);
  }

  function createEngine(areaIds = null) {
    const datasets = areaIds ? areaIds.map(get).filter(Boolean) : list();
    return new global.RS3DependencyEngine(datasets);
  }

  global.RS3RegionRegistry = { register, get, list, listByRegion, createEngine };
  global.RS3ProgressionAreaRegistry = global.RS3RegionRegistry;
})(window);
