import React from 'react';
import { useTranslation } from 'next-i18next';
import { CogIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import type { Task, Team } from '@oscrat/model';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { formatTaskLabel } from '@/lib/tasks';
import { formatDateShort } from '@/utils/dateFormat';

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
      className="hover:bg-surface-muted cursor-pointer transition-colors"
    >
      <td className="px-4 py-4 align-middle">
        <div className="flex min-w-0 items-center gap-2">
          {isAutomatic ? (
            <span
              className="bg-info-subtle text-info-emphasis inline-flex flex-shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs"
              title={t('oscrat.ui.task-origin-automatic')}
            >
              <CogIcon className="h-3 w-3" />
              <span className="hidden sm:inline">
                {t('oscrat.ui.task-origin-automatic-short')}
              </span>
            </span>
          ) : (
            <span
              className="bg-warning-subtle text-warning inline-flex flex-shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs"
              title={t('oscrat.ui.task-origin-manual')}
            >
              <HandRaisedIcon className="h-3 w-3" />
              <span className="hidden sm:inline">
                {t('oscrat.ui.task-origin-manual-short')}
              </span>
            </span>
          )}
          <div
            className="text-content truncate font-medium"
            title={displayTitle}
          >
            {displayTitle}
          </div>
        </div>
      </td>
      <td className="text-content-secondary hidden px-4 py-4 align-middle md:table-cell">
        <div className="truncate" title={product?.name}>
          {product?.name || '-'}
        </div>
      </td>
      <td className="text-content-secondary hidden px-4 py-4 align-middle lg:table-cell">
        <div className="truncate" title={version?.version}>
          {version?.version || '-'}
        </div>
      </td>
      <td className="text-content-secondary hidden whitespace-nowrap px-4 py-4 align-middle sm:table-cell">
        {formatDateShort(task.duedate)}
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
