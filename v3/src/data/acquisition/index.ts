import type { ItemId } from '../../core/ids';
import type { AcquisitionOptionDefinition } from '../../core/acquisition/types';
import { misthalinAcquisitionOptions } from './misthalin';

export const acquisitionOptions: AcquisitionOptionDefinition[] = [
  ...misthalinAcquisitionOptions,
];

export const acquisitionOptionsByItem = acquisitionOptions.reduce(
  (map, option) => {
    const existing = map.get(option.itemId) ?? [];
    existing.push(option);
    map.set(option.itemId, existing);
    return map;
  },
  new Map<ItemId, AcquisitionOptionDefinition[]>(),
);
