import type { PlayerState } from '../player/types';
import type { TaskDefinition } from './types';

const cluePattern = /\bclue\b|treasure trail/i;

export function isClueTask(task: TaskDefinition): boolean {
  return cluePattern.test(`${task.name} ${task.description} ${task.information}`);
}

export function isOptionalSideContent(task: TaskDefinition, player: PlayerState): boolean {
  if (task.category === 'quest' && player.preferences.avoidQuestTasks) return true;
  if (isClueTask(task) && player.preferences.avoidClueTasks) return true;
  return false;
}

export function requiresManualCompletion(task: TaskDefinition, player: PlayerState): boolean {
  return task.routePolicy === 'manual-only' || isOptionalSideContent(task, player);
}
