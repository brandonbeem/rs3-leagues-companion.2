import type { ItemId, TaskId } from '../ids';
import type { PlayerState } from '../player/types';
import { requiresManualCompletion } from '../tasks/manualContent';
import type { AcquisitionStep, TaskDefinition } from '../tasks/types';
import type { AcquisitionCandidate, ItemAcquisitionResolution } from '../acquisition/types';
import type {
  DependencyNode,
  DependencyResolution,
  DependencyStatus,
  DependencySummary,
} from './types';

export interface DependencyContext {
  taskById: Map<TaskId, TaskDefinition>;
  itemName: (itemId: string) => string;
  resolveItem?: (itemId: ItemId, quantity: number) => ItemAcquisitionResolution | null;
  maxDepth?: number;
}

const emptySummary = (): DependencySummary => ({
  total: 0,
  satisfied: 0,
  actionable: 0,
  unresolved: 0,
  manual: 0,
  blocked: 0,
  review: 0,
});

function statusForChildren(children: DependencyNode[]): DependencyStatus {
  if (children.some((child) => child.status === 'blocked')) return 'blocked';
  if (children.some((child) => child.status === 'review')) return 'review';
  if (children.some((child) => child.status === 'manual')) return 'manual';
  if (children.some((child) => child.status === 'unresolved')) return 'unresolved';
  if (children.some((child) => child.status === 'actionable')) return 'actionable';
  return 'satisfied';
}

function itemStatusForChildren(children: DependencyNode[]): DependencyStatus {
  if (children.some((child) => child.status === 'actionable')) return 'actionable';
  if (children.some((child) => child.status === 'manual')) return 'manual';
  if (children.some((child) => child.status === 'review')) return 'review';
  if (children.some((child) => child.status === 'blocked')) return 'blocked';
  return 'unresolved';
}

function actionNode(step: AcquisitionStep, index: number): DependencyNode {
  const manual = step.type === 'complete-quest';
  return {
    id: `action:${step.type}:${index}:${step.label}`,
    kind: manual ? 'quest' : 'action',
    label: step.label,
    status: manual ? 'manual' : 'actionable',
    required: true,
    description: step.notes,
    itemId: step.itemId,
    quantity: step.quantity,
    children: [],
  };
}

function acquisitionNode(candidate: AcquisitionCandidate, taskId: TaskId): DependencyNode {
  const status: DependencyStatus = candidate.status === 'available'
    ? 'actionable'
    : candidate.status === 'manual'
      ? 'manual'
      : 'review';
  const details = [
    candidate.method.replaceAll('-', ' '),
    candidate.estimatedSeconds === null ? null : `about ${candidate.estimatedSeconds}s`,
    candidate.coinCost === null ? null : `${candidate.coinCost} coins`,
    ...(candidate.notes ?? []),
  ].filter((value): value is string => Boolean(value));

  return {
    id: `acquisition:${taskId}:${candidate.id}`,
    kind: 'action',
    label: candidate.label,
    status,
    required: true,
    description: details.join(' · '),
    itemId: candidate.itemId,
    children: [],
  };
}

function buildTaskNode(
  task: TaskDefinition,
  player: PlayerState,
  context: DependencyContext,
  visiting: Set<TaskId>,
  depth: number,
): DependencyNode {
  const completed = player.completedTaskIds.includes(task.id);
  if (completed) {
    return {
      id: `task:${task.id}`,
      kind: 'task',
      label: task.name,
      status: 'satisfied',
      required: true,
      taskId: task.id,
      children: [],
    };
  }

  if (visiting.has(task.id)) {
    return {
      id: `cycle:${task.id}`,
      kind: 'cycle',
      label: `Dependency cycle detected at ${task.name}`,
      status: 'blocked',
      required: true,
      taskId: task.id,
      children: [],
    };
  }

  if (depth > (context.maxDepth ?? 12)) {
    return {
      id: `depth:${task.id}`,
      kind: 'review',
      label: `Dependency depth limit reached for ${task.name}`,
      status: 'review',
      required: true,
      taskId: task.id,
      children: [],
    };
  }

  const nextVisiting = new Set(visiting);
  nextVisiting.add(task.id);
  const children: DependencyNode[] = [];

  task.requirements.skills.forEach((requirement) => {
    const currentLevel = player.skills[requirement.skill] ?? 1;
    const satisfied = currentLevel >= requirement.level;
    children.push({
      id: `skill:${task.id}:${requirement.skill}:${requirement.level}`,
      kind: 'skill',
      label: `${requirement.skill} ${requirement.level}`,
      status: satisfied ? 'satisfied' : 'actionable',
      required: true,
      description: satisfied
        ? `Current level ${currentLevel}`
        : `Train ${requirement.skill} from ${currentLevel} to ${requirement.level}`,
      skill: requirement.skill,
      currentValue: currentLevel,
      targetValue: requirement.level,
      children: [],
    });
  });

  task.requirements.items.forEach((requirement) => {
    const sharedResolution = context.resolveItem?.(requirement.itemId, requirement.quantity) ?? null;
    const carried = player.inventory[requirement.itemId] ?? 0;
    const banked = player.bankInventory[requirement.itemId] ?? 0;
    const persistentOwned = player.ownedAssetIds.includes(requirement.itemId);
    const satisfied = sharedResolution?.satisfied ?? persistentOwned || carried >= requirement.quantity;
    const matchingSteps = task.acquisitionSteps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.type === 'obtain-item' && step.itemId === requirement.itemId)
      .map(({ step, index }) => actionNode(step, index));
    const sharedSteps = sharedResolution?.bestOption
      ? [acquisitionNode(sharedResolution.bestOption, task.id)]
      : [];
    const itemChildren = satisfied ? [] : [...sharedSteps, ...matchingSteps];
    const itemLabel = requirement.label ?? context.itemName(requirement.itemId);

    children.push({
      id: `item:${task.id}:${requirement.itemId}`,
      kind: 'item',
      label: `${requirement.quantity}× ${itemLabel}`,
      status: satisfied
        ? 'satisfied'
        : itemChildren.length > 0
          ? itemStatusForChildren(itemChildren)
          : 'unresolved',
      required: true,
      description: persistentOwned
        ? 'Recorded as a reusable owned asset'
        : carried >= requirement.quantity
          ? `${carried} currently recorded in inventory`
          : banked >= requirement.quantity
            ? `${banked} recorded in the bank; withdrawal can be planned`
            : requirement.mustBeOwnedBeforeRoute
              ? 'Must be owned before this route starts'
              : 'Can be obtained during route preparation',
      itemId: requirement.itemId,
      currentValue: carried,
      targetValue: requirement.quantity,
      quantity: requirement.quantity,
      children: itemChildren,
    });
  });

  task.requirements.quests.forEach((questId) => {
    const satisfied = player.questIds.includes(questId);
    children.push({
      id: `quest:${task.id}:${questId}`,
      kind: 'quest',
      label: questId,
      status: satisfied ? 'satisfied' : 'manual',
      required: true,
      description: satisfied
        ? 'Quest completion is recorded'
        : 'Quest prerequisites are player-controlled side content and are never inserted automatically',
      children: [],
    });
  });

  task.requirements.unlocks.forEach((unlockId) => {
    const satisfied = player.unlockIds.includes(unlockId);
    children.push({
      id: `unlock:${task.id}:${unlockId}`,
      kind: 'unlock',
      label: unlockId,
      status: satisfied ? 'satisfied' : 'unresolved',
      required: true,
      description: satisfied ? 'Unlock is recorded' : 'No automatic unlock path is recorded yet',
      children: [],
    });
  });

  task.requirements.completedTaskIds.forEach((requiredTaskId) => {
    const prerequisite = context.taskById.get(requiredTaskId);
    if (!prerequisite) {
      children.push({
        id: `task-missing:${task.id}:${requiredTaskId}`,
        kind: 'task',
        label: requiredTaskId.replace('task:', ''),
        status: 'unresolved',
        required: true,
        taskId: requiredTaskId,
        description: 'Required task record has not been migrated yet',
        children: [],
      });
      return;
    }

    const prerequisiteNode = buildTaskNode(prerequisite, player, context, nextVisiting, depth + 1);
    if (requiresManualCompletion(prerequisite, player) && prerequisiteNode.status !== 'satisfied') {
      prerequisiteNode.status = 'manual';
      prerequisiteNode.description = 'This prerequisite is optional/manual content and will not be inserted automatically';
    }
    children.push(prerequisiteNode);
  });

  const attachedItemStepKeys = new Set(
    task.requirements.items.flatMap((requirement) =>
      task.acquisitionSteps
        .map((step, index) => ({ step, index }))
        .filter(({ step }) => step.type === 'obtain-item' && step.itemId === requirement.itemId)
        .map(({ index }) => index),
    ),
  );

  task.acquisitionSteps.forEach((step, index) => {
    if (attachedItemStepKeys.has(index)) return;
    if (step.type === 'train-skill') return;
    children.push(actionNode(step, index));
  });

  if (task.routePolicy === 'blocked-review' || task.reviewStatus === 'placeholder') {
    children.push({
      id: `review:${task.id}`,
      kind: 'review',
      label: 'Task data requires verification before automatic routing',
      status: 'review',
      required: true,
      children: [],
    });
  }

  const manualRoot = requiresManualCompletion(task, player);
  const childStatus = statusForChildren(children);
  const status: DependencyStatus = manualRoot
    ? 'manual'
    : childStatus === 'satisfied'
      ? 'actionable'
      : childStatus;

  return {
    id: `task:${task.id}`,
    kind: 'task',
    label: task.name,
    status,
    required: true,
    taskId: task.id,
    description: manualRoot
      ? 'This task stays visible but is excluded from automatic dependency expansion'
      : task.information,
    children,
  };
}

function flatten(root: DependencyNode): DependencyNode[] {
  return [root, ...root.children.flatMap(flatten)];
}

export function resolveTaskDependencies(
  task: TaskDefinition,
  player: PlayerState,
  context: DependencyContext,
): DependencyResolution {
  const root = buildTaskNode(task, player, context, new Set<TaskId>(), 0);
  const nodes = flatten(root);
  const summary = nodes.reduce((result, node) => {
    result.total += 1;
    result[node.status] += 1;
    return result;
  }, emptySummary());

  const hasCycle = nodes.some((node) => node.kind === 'cycle');
  const manualReasons = nodes
    .filter((node) => node.status === 'manual')
    .map((node) => node.label);
  const unresolvedReasons = nodes
    .filter((node) => node.status === 'unresolved' || node.status === 'blocked' || node.status === 'review')
    .map((node) => node.label);

  return {
    root,
    summary,
    canAutoResolve:
      !hasCycle &&
      summary.manual === 0 &&
      summary.unresolved === 0 &&
      summary.blocked === 0 &&
      summary.review === 0,
    hasCycle,
    manualReasons: Array.from(new Set(manualReasons)),
    unresolvedReasons: Array.from(new Set(unresolvedReasons)),
  };
}
