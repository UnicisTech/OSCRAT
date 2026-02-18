import { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { asyncWithToast } from '@/lib/utils';

interface LinkedTask {
  taskId: number;
  taskNumber: number;
  title: string;
  status: string;
}

interface AvailableTask {
  id: number;
  taskNumber: number;
  title: string;
}

interface UseLinkedTasksConfig {
  linkedTasks: LinkedTask[] | undefined;
  availableTasks: AvailableTask[] | undefined;
  onLinkTask: (taskId: number) => Promise<unknown>;
  onUnlinkTask: (taskId: number) => Promise<unknown>;
}

export function useLinkedTasks({
  linkedTasks,
  availableTasks,
  onLinkTask,
  onUnlinkTask,
}: UseLinkedTasksConfig) {
  const { t } = useTranslation('common');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [createTaskVisible, setCreateTaskVisible] = useState(false);

  const filteredAvailableTasks = useMemo(() => {
    if (!availableTasks || !linkedTasks) return availableTasks || [];
    const linkedTaskIds = new Set(linkedTasks.map((lt) => lt.taskId));
    return availableTasks.filter((task) => !linkedTaskIds.has(task.id));
  }, [availableTasks, linkedTasks]);

  const handleLinkTask = async () => {
    if (!selectedTaskId) return;

    const result = await asyncWithToast(
      () => onLinkTask(Number(selectedTaskId)),
      t('oscrat.ui.documentation.task-linked'),
      t('error')
    );
    if (result) setSelectedTaskId('');
  };

  const handleUnlinkTask = async (taskId: number) => {
    await asyncWithToast(
      () => onUnlinkTask(taskId),
      t('oscrat.ui.documentation.task-unlinked'),
      t('error')
    );
  };

  const handleTaskCreatedAndLink = async (taskId: number) => {
    await asyncWithToast(
      () => onLinkTask(taskId),
      t('oscrat.ui.documentation.task-created-and-linked'),
      t('error')
    );
  };

  return {
    selectedTaskId,
    setSelectedTaskId,
    createTaskVisible,
    setCreateTaskVisible,
    filteredAvailableTasks,
    handleLinkTask,
    handleUnlinkTask,
    handleTaskCreatedAndLink,
  };
}
