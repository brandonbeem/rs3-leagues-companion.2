import type { ItemId } from '../ids';
import type { PlayerState } from '../player/types';
import type { TaskDefinition } from '../tasks/types';
import type { ItemDefinition } from '../../data/items';
import type {
  AcquisitionCandidate,
  AcquisitionCandidateStatus,
  AcquisitionOptionDefinition,
  ItemAcquisitionResolution,
  ResourceOpportunity,
} from './types';

export type AcquisitionLibrary = Map<ItemId, AcquisitionOptionDefinition[]>;

function candidateStatus(option: AcquisitionOptionDefinition): AcquisitionCandidateStatus {
  if (!option.automatic || option.method === 'manual') return 'manual';
  if (option.reviewStatus !== 'verified') return 'review';
  return 'available';
}

function candidateScore(option: AcquisitionOptionDefinition, status: AcquisitionCandidateStatus): number {
  const timeCost = option.estimatedSeconds ?? 600;
  const coinCost = (option.coinCost ?? 0) / 10;
  const statusPenalty = status === 'available' ? 0 : status === 'review' ? 1_000 : 2_000;
  return timeCost + coinCost + statusPenalty;
}

function asCandidate(option: AcquisitionOptionDefinition): AcquisitionCandidate {
  const status = candidateStatus(option);
  return { ...option, status, score: candidateScore(option, status) };
}

function bankCandidate(itemId: ItemId): AcquisitionCandidate {
  const option: AcquisitionOptionDefinition = {
    id: `bank:${itemId}`,
    itemId,
    label: 'Withdraw the item from your bank',
    method: 'bank',
    estimatedSeconds: 20,
    coinCost: 0,
    reusable: false,
    automatic: true,
    reviewStatus: 'verified',
    notes: ['Available because enough of this item is recorded in the player bank.'],
  };
  return { ...asCandidate(option), generated: true };
}

export function resolveItemAcquisition(
  item: ItemDefinition,
  quantity: number,
  player: PlayerState,
  library: AcquisitionLibrary,
): ItemAcquisitionResolution {
  const inventoryQuantity = player.inventory[item.id] ?? 0;
  const bankQuantity = player.bankInventory[item.id] ?? 0;
  const persistentOwned = item.persistent && player.ownedAssetIds.includes(item.id);
  const satisfied = persistentOwned || inventoryQuantity >= quantity;

  if (satisfied) {
    return {
      itemId: item.id,
      quantity,
      inventoryQuantity,
      bankQuantity,
      persistentOwned,
      satisfied: true,
      bestOption: null,
      alternatives: [],
    };
  }

  const candidates = (library.get(item.id) ?? []).map(asCandidate);
  if (bankQuantity >= quantity) candidates.push(bankCandidate(item.id));
  candidates.sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));

  return {
    itemId: item.id,
    quantity,
    inventoryQuantity,
    bankQuantity,
    persistentOwned,
    satisfied: false,
    bestOption: candidates[0] ?? null,
    alternatives: candidates.slice(1),
  };
}

export function buildResourceOpportunities(
  tasks: TaskDefinition[],
  player: PlayerState,
  items: ItemDefinition[],
  library: AcquisitionLibrary,
  limit = 3,
): ResourceOpportunity[] {
  return items
    .filter((item) => item.persistent && item.starterKitEligible)
    .map((item) => {
      const opportunityTasks = tasks.filter((task) =>
        !player.completedTaskIds.includes(task.id)
        && task.requirements.items.some((requirement) => requirement.itemId === item.id),
      );
      const highestQuantity = opportunityTasks.reduce(
        (highest, task) => Math.max(
          highest,
          ...task.requirements.items
            .filter((requirement) => requirement.itemId === item.id)
            .map((requirement) => requirement.quantity),
        ),
        1,
      );
      const resolution = resolveItemAcquisition(item, highestQuantity, player, library);
      const acquisitionPenalty = resolution.bestOption
        ? Math.min(90, Math.round(resolution.bestOption.score / 20))
        : 100;
      const score = opportunityTasks.length * 100 + 35 - acquisitionPenalty;

      return {
        itemId: item.id,
        itemName: item.name,
        opportunityTaskIds: opportunityTasks.map((task) => task.id),
        opportunityCount: opportunityTasks.length,
        score,
        bestOption: resolution.bestOption,
      };
    })
    .filter((opportunity) => opportunity.opportunityCount > 0)
    .sort((a, b) => b.score - a.score || b.opportunityCount - a.opportunityCount || a.itemName.localeCompare(b.itemName))
    .slice(0, limit);
}
