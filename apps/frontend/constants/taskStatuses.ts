import { TaskStatus, TaskOriginType } from '@oscrat/model';

export const TASK_STATUS_TRANSLATION_MAP: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'oscrat.ui.task-status-todo',
  [TaskStatus.PLANNED]: 'oscrat.ui.task-status-planned',
  [TaskStatus.IN_PROGRESS]: 'oscrat.ui.task-status-in-progress',
  [TaskStatus.DONE]: 'oscrat.ui.task-status-done',
};

export function getTaskStatusTranslationKey(status: TaskStatus): string {
  return TASK_STATUS_TRANSLATION_MAP[status];
}

export const DEFAULT_TASK_STATUS = TaskStatus.TODO;

export const DEFAULT_TASK_ORIGIN_TYPE = TaskOriginType.MANUAL;
