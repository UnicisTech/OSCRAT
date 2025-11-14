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
  const { updateTask, isLoading } = useTask(team.slug, task.taskNumber.toString());

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
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
