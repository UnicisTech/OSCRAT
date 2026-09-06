import { TaskStatus, TaskOriginType, TaskType } from '@oscrat/model';

export const TASK_STATUS_TRANSLATION_MAP: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'oscrat.ui.task-status-todo',
  [TaskStatus.PLANNED]: 'oscrat.ui.task-status-planned',
  [TaskStatus.IN_PROGRESS]: 'oscrat.ui.task-status-in-progress',
  [TaskStatus.DONE]: 'oscrat.ui.task-status-done',
};

export function getTaskStatusTranslationKey(status: TaskStatus): string {
  return TASK_STATUS_TRANSLATION_MAP[status];
}

// Display order follows the Risk Assessment addendum spec: the catch-all
// GENERIC ("Other") comes last.
export const TASK_TYPE_ORDER: TaskType[] = [
  TaskType.VULNERABILITY,
  TaskType.INCIDENT,
  TaskType.SBOM,
  TaskType.DOCUMENTATION,
  TaskType.RISK,
  TaskType.TRAINING,
  TaskType.CONFIGURATION_MANAGEMENT,
  TaskType.REQUIREMENTS,
  TaskType.GENERIC,
];

export const TASK_TYPE_TRANSLATION_MAP: Record<TaskType, string> = {
  [TaskType.VULNERABILITY]: 'oscrat.ui.task-type-vulnerability',
  [TaskType.INCIDENT]: 'oscrat.ui.task-type-incident',
  [TaskType.SBOM]: 'oscrat.ui.task-type-sbom',
  [TaskType.DOCUMENTATION]: 'oscrat.ui.task-type-documentation',
  [TaskType.RISK]: 'oscrat.ui.task-type-risk',
  [TaskType.TRAINING]: 'oscrat.ui.task-type-training',
  [TaskType.CONFIGURATION_MANAGEMENT]:
    'oscrat.ui.task-type-configuration-management',
  [TaskType.REQUIREMENTS]: 'oscrat.ui.task-type-requirements',
  [TaskType.GENERIC]: 'oscrat.ui.task-type-generic',
};

export function getTaskTypeTranslationKey(taskType: TaskType): string {
  return TASK_TYPE_TRANSLATION_MAP[taskType];
}

export const DEFAULT_TASK_TYPE = TaskType.GENERIC;

export const DEFAULT_TASK_STATUS = TaskStatus.TODO;

export const DEFAULT_TASK_ORIGIN_TYPE = TaskOriginType.MANUAL;
