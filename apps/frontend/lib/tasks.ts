import type { TFunction } from 'next-i18next';
import { truncateAtWordBoundary } from '@/lib/text-sanitize';

const TASK_TITLE_MAX = 100;

type LocalizedFields = { properties?: unknown };
type TaskTitleFields = LocalizedFields & {
  title?: string | null;
  titleLocId?: string | null;
};
type TaskDescriptionFields = LocalizedFields & {
  description?: string | null;
  descriptionLocId?: string | null;
};

const interpolationValues = (task: LocalizedFields) =>
  (task.properties ?? {}) as Record<string, unknown>;

export const resolveTaskTitle = (task: TaskTitleFields, t: TFunction): string =>
  task.title ||
  (task.titleLocId
    ? truncateAtWordBoundary(
        t(task.titleLocId, interpolationValues(task)),
        TASK_TITLE_MAX
      )
    : '');

// Prefixes the team-scoped task number so tasks sharing a title can be told
// apart, e.g. "#42: Patch dependency".
export const formatTaskLabel = (
  task: TaskTitleFields & { taskNumber: number },
  t: TFunction
): string => `#${task.taskNumber}: ${resolveTaskTitle(task, t)}`;

export const resolveTaskDescription = (
  task: TaskDescriptionFields,
  t: TFunction
): string =>
  task.description ||
  (task.descriptionLocId
    ? t(task.descriptionLocId, interpolationValues(task))
    : '');

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
};

export const taskNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Cybersecurity Controls',
      active: activeTab === 'Cybersecurity Controls',
    },
  ];
};

export const taskCommentsNavigations = (activeTab: string) => {
  return [
    {
      name: 'Comments',
      active: activeTab === 'Comments',
    },
    {
      name: 'Audit logs',
      active: activeTab === 'Audit logs',
    },
  ];
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', dateOptions);
  return formatter.format(date);
};
