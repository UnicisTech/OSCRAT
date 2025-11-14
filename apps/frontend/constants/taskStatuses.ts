import { TaskStatus, TaskOriginType } from '@oscrat/model';

/**
 * Task status translation map
 */
export const TASK_STATUS_TRANSLATION_MAP: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'oscrat.ui.task-status-todo',
  [TaskStatus.PLANNED]: 'oscrat.ui.task-status-planned',
  [TaskStatus.IN_PROGRESS]: 'oscrat.ui.task-status-in-progress',
  [TaskStatus.DONE]: 'oscrat.ui.task-status-done',
};

/**
 * Get the translation key for a task status
 */
export function getTaskStatusTranslationKey(status: TaskStatus): string {
  return TASK_STATUS_TRANSLATION_MAP[status];
}

/**
 * Default status for new tasks
 */
export const DEFAULT_TASK_STATUS = TaskStatus.TODO;

/**
 * Default origin type for new tasks
 */
export const DEFAULT_TASK_ORIGIN_TYPE = TaskOriginType.MANUAL;

