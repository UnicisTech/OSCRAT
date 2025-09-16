import React from 'react';
import { useTranslation } from 'next-i18next';
import { EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { Task, Team } from '@oscrat/model';

interface TaskListItemProps {
  task: Task;
  team: Team;
  statusDropdown: React.ComponentType<{
    task: Task;
    team: Team;
  }>;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  team,
  statusDropdown,
}) => {
  const { t, ready } = useTranslation('common');
  
  if (!ready) return null;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 truncate align-middle">
        <div className="font-medium text-gray-900">
          {task.title}
        </div>
      </td>
      <td className="px-6 py-4 truncate align-middle text-gray-700">
        {/* Mock product name - replace with actual data */}
        Product Alpha
      </td>
      <td className="px-6 py-4 truncate align-middle text-gray-700">
        {/* Mock version name - replace with actual data */}
        v1.2.0
      </td>
      <td className="px-6 py-4 truncate align-middle text-gray-700">
        {new Date(task.duedate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 truncate align-middle text-gray-700">
        {/* Mock section - replace with actual data */}
        Development
      </td>
      <td className="px-6 py-4 truncate align-middle text-gray-700">
        {/* Mock assignee - replace with actual data when available */}
        Unassigned
      </td>
      <td className="px-6 py-4 align-middle">
        {React.createElement(statusDropdown, {
          task,
          team,
        })}
      </td>
      <td className="px-6 py-4 align-middle">
        <Link
          href={`/teams/${team.slug}/tasks/${task.taskNumber}`}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <EyeIcon className="h-4 w-4" />
          <span className="ml-1">{t('view')}</span>
        </Link>
      </td>
    </tr>
  );
};

export default TaskListItem;
