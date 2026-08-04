export type EntityId<Prefix extends string> = `${Prefix}:${string}`;

export type RegionId = EntityId<'region'>;
export type TownId = EntityId<'town'>;
export type LocationId = EntityId<'location'>;
export type TaskId = EntityId<'task'>;
export type ItemId = EntityId<'item'>;
export type TeleportId = EntityId<'teleport'>;

export const ids = {
  region: (slug: string) => `region:${slug}` as RegionId,
  town: (slug: string) => `town:${slug}` as TownId,
  location: (slug: string) => `location:${slug}` as LocationId,
  task: (slug: string) => `task:${slug}` as TaskId,
  item: (slug: string) => `item:${slug}` as ItemId,
  teleport: (slug: string) => `teleport:${slug}` as TeleportId,
};
