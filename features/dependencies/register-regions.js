/* Dataset registration layer. Add future region data files before this file. */
(function registerProgressionRegions(global) {
  'use strict';
  const fort = global.RS3_FORT_FORINTHRY_DATA;
  if (!fort || !global.RS3RegionRegistry) return;
  global.RS3RegionRegistry.register({
    ...fort,
    id: 'misthalin-fort-forinthry',
    name: 'Fort Forinthry',
    parentRegion: 'Misthalin',
    icon: '🏰',
    description: 'Quest, building, material, and boss progression at Fort Forinthry.'
  });
})(window);
