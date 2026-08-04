import type { PlayerState } from '../player/types';
import type { TaskDefinition, TaskEligibility } from './types';

export function getTaskEligibility(task: TaskDefinition, player: PlayerState): TaskEligibility {
  const missingSkills = task.requirements.skills.filter(
    (requirement) => (player.skills[requirement.skill] ?? 1) < requirement.level,
  );
  const missingItems = task.requirements.items.filter(
    (requirement) => (player.inventory[requirement.itemId] ?? 0) < requirement.quantity,
  );
  const missingQuests = task.requirements.quests.filter((quest) => !player.questIds.includes(quest));
  const missingUnlocks = task.requirements.unlocks.filter((unlock) => !player.unlockIds.includes(unlock));
  const missingTasks = task.requirements.completedTaskIds.filter(
    (taskId) => !player.completedTaskIds.includes(taskId),
  );
  const blockedByReview = task.routePolicy === 'blocked-review';

  return {
    available:
      !blockedByReview &&
      missingSkills.length === 0 &&
      missingItems.length === 0 &&
      missingQuests.length === 0 &&
      missingUnlocks.length === 0 &&
      missingTasks.length === 0,
    missingSkills,
    missingItems,
    missingQuests,
    missingUnlocks,
    missingTasks,
    blockedByReview,
  };
}

export function taskBlockers(task: TaskDefinition, player: PlayerState): string[] {
  const eligibility = getTaskEligibility(task, player);
  const blockers: string[] = [];
  eligibility.missingSkills.forEach((requirement) => blockers.push(`${requirement.skill} ${requirement.level}`));
  eligibility.missingItems.forEach((requirement) => blockers.push(`${requirement.quantity}× ${requirement.itemId.replace('item:', '').replaceAll('-', ' ')}`));
  eligibility.missingQuests.forEach((quest) => blockers.push(`Quest: ${quest}`));
  eligibility.missingUnlocks.forEach((unlock) => blockers.push(`Unlock: ${unlock}`));
  if (eligibility.blockedByReview) blockers.push('Location data needs review');
  return blockers;
}
