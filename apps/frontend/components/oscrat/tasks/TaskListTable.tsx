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
    <div className="bg-surface border-line rounded-card border">
      <table className="text-content-secondary divide-line-subtle w-full table-fixed divide-y text-left text-sm">
        <thead className="bg-surface-muted">
          <tr>
            <th className="text-content w-[40%] p-4 text-b2 font-medium">
              {t('task')}
            </th>
            <th className="text-content hidden w-[20%] whitespace-nowrap p-4 text-b2 font-medium md:table-cell">
              {t('product')}
            </th>
            <th className="text-content hidden w-[15%] whitespace-nowrap p-4 text-b2 font-medium lg:table-cell">
              {t('version')}
            </th>
            <th className="text-content hidden w-[12%] whitespace-nowrap p-4 text-b2 font-medium sm:table-cell">
              {t('due-date')}
            </th>
            <th className="text-content w-[13%] whitespace-nowrap p-4 text-b2 font-medium">
              {t('status')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-line-subtle divide-y">
          {tasks.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-content-muted px-6 py-8 text-center"
              >
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
