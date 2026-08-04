import { misthalinEarlyTasks } from './misthalinEarly';

export const tasks = [...misthalinEarlyTasks];
export const taskById = new Map(tasks.map((task) => [task.id, task]));

export const taskMigrationSummary = {
  total: tasks.length,
  verified: tasks.filter((task) => task.reviewStatus === 'verified').length,
  needsReview: tasks.filter((task) => task.reviewStatus === 'needs-review').length,
  quickWins: tasks.filter((task) => task.priority === 'Quick Win').length,
  totalPoints: tasks.reduce((total, task) => total + task.points, 0),
};
