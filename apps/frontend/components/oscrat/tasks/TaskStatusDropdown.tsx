import React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import type { Task, Team } from '@oscrat/model';
import { TaskStatus } from '@oscrat/model';
import type { ApiError } from '@/types';
import { useTask } from '@/hooks/useTask';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';

interface TaskStatusDropdownProps {
  task: Task;
  team: Team;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({
  task,
  team,
}) => {
  const { t, ready } = useTranslation('common');
  const { updateTask, isLoading } = useTask(
    team.slug,
    task.taskNumber.toString()
  );

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as TaskStatus;

    try {
      await updateTask({ status: newStatus });
      toast.success(t('task-status-updated'));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message);
      e.target.value = task.status;
    }
  };

  if (!ready) return null;

  return (
    <select
      value={task.status}
      onChange={handleStatusChange}
      disabled={isLoading}
      className="border-line bg-surface text-content-secondary shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted rounded-input w-full border px-2 py-1 text-xs focus:outline-none focus:ring-1 disabled:cursor-not-allowed"
    >
      {Object.values(TaskStatus).map((status) => (
        <option key={status} value={status}>
          {t(getTaskStatusTranslationKey(status))}
        </option>
      ))}
    </select>
  );
};

export default TaskStatusDropdown;
