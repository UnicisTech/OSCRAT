import React from 'react';
import { useTranslation } from 'next-i18next';
import { CogIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import type { Task, Team } from '@oscrat/model';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { formatTaskLabel } from '@/lib/tasks';

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
  const router = useRouter();
  
  // Fetch product and version data if available
  const { project: product } = useOscratProject(
    team.slug,
    task.productId || '',
    { enabled: !!task.productId }
  );
  
  const { version } = useOscratVersion(
    team.slug,
    task.productId || '',
    task.versionId || '',
    { enabled: !!task.productId && !!task.versionId }
  );
  
  if (!ready) return null;

  const isAutomatic = task.originType === 'AUTOMATIC';
  const displayTitle = formatTaskLabel(task, t);
  
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the status dropdown
    const target = e.target as HTMLElement;
    if (target.closest('select') || target.closest('button')) {
      return;
    }
    router.push(`/organization/${team.slug}/tasks/${task.taskNumber}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-2 min-w-0">
          {isAutomatic ? (
            <span 
              className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
              title={t('oscrat.ui.task-origin-automatic')}
            >
              <CogIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{t('oscrat.ui.task-origin-automatic-short')}</span>
            </span>
          ) : (
            <span 
              className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700"
              title={t('oscrat.ui.task-origin-manual')}
            >
              <HandRaisedIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{t('oscrat.ui.task-origin-manual-short')}</span>
            </span>
          )}
          <div className="font-medium text-gray-900 truncate" title={displayTitle}>
            {displayTitle}
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-4 py-4 align-middle text-gray-700">
        <div className="truncate" title={product?.name}>
          {product?.name || "-"}
        </div>
      </td>
      <td className="hidden lg:table-cell px-4 py-4 align-middle text-gray-700">
        <div className="truncate" title={version?.version}>
          {version?.version || "-"}
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-4 align-middle text-gray-700 whitespace-nowrap">
        {new Date(task.duedate).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 align-middle">
        {React.createElement(statusDropdown, {
          task,
          team,
        })}
      </td>
    </tr>
  );
};

export default TaskListItem;
