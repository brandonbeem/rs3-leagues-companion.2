import type { RegionId } from '../ids';
import type { PlayerState } from '../player/types';
import { isRegionUnlocked } from '../regions/regionEngine';
import { isOptionalSideContent } from './manualContent';
import type { TaskDefinition, TaskEligibility } from './types';

export function isTaskAllowedInRecommendedRoutes(task: TaskDefinition, player: PlayerState): boolean {
  return !isOptionalSideContent(task, player);
}

export function getTaskEligibility(task: TaskDefinition, player: PlayerState): TaskEligibility {
  const completed = player.completedTaskIds.includes(task.id);
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
  const regionBlocked = !isRegionUnlocked(player, task.regionId as RegionId);
  const blockedByReview = task.routePolicy === 'blocked-review' || task.reviewStatus === 'placeholder';

  const hardBlocked =
    regionBlocked ||
    blockedByReview ||
    missingSkills.length > 0 ||
    missingQuests.length > 0 ||
    missingUnlocks.length > 0 ||
    missingTasks.length > 0;

  const setupNeeded = !hardBlocked && missingItems.length > 0;
  const warnings: string[] = [];
  if (regionBlocked) warnings.push('Region is locked');
  if (task.routePolicy === 'manual-only') warnings.push('Manual or variable completion route');
  if (task.reviewStatus === 'needs-review') warnings.push('Some task-routing details need review');
  if (task.estimatedSeconds === null) warnings.push('Completion time is not estimated yet');
  if (missingQuests.length > 0 && player.preferences.avoidQuestTasks) {
    warnings.push('Quest prerequisites are excluded from automatic routes');
  }

  const status: TaskEligibility['status'] = completed
    ? 'completed'
    : hardBlocked
      ? 'blocked'
      : setupNeeded
        ? 'setup-needed'
        : 'available';

  return {
    status,
    available: status === 'available' || status === 'setup-needed',
    missingSkills,
    missingItems,
    missingQuests,
    missingUnlocks,
    missingTasks,
    blockedByReview,
    warnings,
  };
}

export function taskBlockers(task: TaskDefinition, player: PlayerState): string[] {
  const eligibility = getTaskEligibility(task, player);
  const blockers: string[] = [];

  eligibility.missingSkills.forEach((requirement) => blockers.push(`${requirement.skill} ${requirement.level}`));
  eligibility.missingItems.forEach((requirement) => {
    const label = requirement.label ?? requirement.itemId.replace('item:', '').replaceAll('-', ' ');
    blockers.push(`${requirement.quantity}× ${label}`);
  });
  eligibility.missingQuests.forEach((quest) => {
    blockers.push(player.preferences.avoidQuestTasks ? `Optional quest: ${quest}` : `Quest: ${quest}`);
  });
  eligibility.missingUnlocks.forEach((unlock) => blockers.push(`Unlock: ${unlock}`));
  eligibility.missingTasks.forEach((taskId) => blockers.push(`Task: ${taskId.replace('task:', '')}`));
  if (eligibility.blockedByReview) blockers.push('Task data is blocked pending review');

  return blockers;
}

export function taskStatusLabel(status: TaskEligibility['status']): string {
  if (status === 'setup-needed') return 'Setup needed';
  return status.charAt(0).toUpperCase() + status.slice(1);
}
