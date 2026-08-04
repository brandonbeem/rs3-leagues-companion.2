import { misthalinEarlyTasks } from './misthalinEarly';
import { misthalinExpansionTasks } from './misthalinExpansion';
import { misthalinRemainingEasyMediumTasks } from './misthalinRemainingEasyMedium';
import { misthalinHardTasks } from './misthalinHard';
import { misthalinEliteMasterTasks } from './misthalinEliteMaster';

export const tasks = [
  ...misthalinEarlyTasks,
  ...misthalinExpansionTasks,
  ...misthalinRemainingEasyMediumTasks,
  ...misthalinHardTasks,
  ...misthalinEliteMasterTasks,
];
export const taskById = new Map(tasks.map((task) => [task.id, task]));

export const taskMigrationSummary = {
  total: tasks.length,
  verified: tasks.filter((task) => task.reviewStatus === 'verified').length,
  needsReview: tasks.filter((task) => task.reviewStatus === 'needs-review').length,
  quickWins: tasks.filter((task) => task.priority === 'Quick Win').length,
  totalPoints: tasks.reduce((total, task) => total + task.points, 0),
  byTier: {
    easy: tasks.filter((task) => task.tier === 'easy').length,
    medium: tasks.filter((task) => task.tier === 'medium').length,
    hard: tasks.filter((task) => task.tier === 'hard').length,
    elite: tasks.filter((task) => task.tier === 'elite').length,
    master: tasks.filter((task) => task.tier === 'master').length,
  },
};
