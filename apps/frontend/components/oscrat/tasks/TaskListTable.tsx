import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Task, Team } from '@oscrat/model';
import TaskListItem from './TaskListItem';

interface TaskListTableProps {
  tasks: Task[];
  team: Team;
  statusDropdown: React.ComponentType<{
    task: Task;
    team: Team;
  }>;
}

const TaskListTable: React.FC<TaskListTableProps> = ({
  tasks,
  team,
  statusDropdown,
}) => {
  const { t, ready } = useTranslation('common');
  
  if (!ready) return null;

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 w-auto min-w-[300px]">
              {t('task')}
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
              {t('product')}
            </th>
            <th className="hidden lg:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
              {t('version')}
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
              {t('due-date')}
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
              {t('status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                {t('no-tasks-yet')}
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                team={team}
                statusDropdown={statusDropdown}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
