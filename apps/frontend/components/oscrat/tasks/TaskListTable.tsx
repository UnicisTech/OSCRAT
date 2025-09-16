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
      <table className="w-full table-fixed text-left text-sm text-gray-600">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="w-[200px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('task')}
            </th>
            <th className="w-[150px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('product')}
            </th>
            <th className="w-[150px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('version')}
            </th>
            <th className="w-[120px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('date-added')}
            </th>
            <th className="w-[120px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('section')}
            </th>
            <th className="w-[150px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('assignee')}
            </th>
            <th className="w-[120px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('status')}
            </th>
            <th className="w-[80px] px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
