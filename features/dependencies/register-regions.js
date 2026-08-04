/* Progression-area registration layer. Load all data files before this file. */
(function registerProgressionAreas(global) {
  'use strict';

  const registry = global.RS3RegionRegistry;
  if (!registry) return;

  const areas = [
    {
      data: global.RS3_FORT_FORINTHRY_DATA,
      id: 'misthalin-fort-forinthry',
      name: 'Fort Forinthry',
      parentRegion: 'Misthalin',
      dashboardRegionId: 'misthalin',
      icon: '🏰',
      description: 'Quest, building, material, and boss progression at Fort Forinthry.'
    },
    {
      data: global.RS3_CITY_OF_UM_DATA,
      id: 'misthalin-city-of-um',
      name: 'City of Um',
      parentRegion: 'Misthalin',
      dashboardRegionId: 'misthalin',
      icon: '💀',
      description: 'Necromancy quests, rituals, conjures, achievements, bosses, and equipment progression in the City of Um.'
    }
  ];

  areas.forEach(({ data, ...metadata }) => {
    if (!data) return;
    registry.register({ ...data, ...metadata });
  });
})(window);
