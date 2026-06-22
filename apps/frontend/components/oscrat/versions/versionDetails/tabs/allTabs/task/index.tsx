import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  TabHeader,
  TableWrapper,
  TableHeader,
  TableRow,
  TabActionButton,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { TaskStatus } from '@oscrat/model';
import type { Task, Team } from '@oscrat/model';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import useTasks from '@/hooks/useTasks';
import { TASK_STATUS_TRANSLATION_MAP } from '@/constants/taskStatuses';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CreateTask } from '@/components/interfaces/Task';
import TaskStatusDropdown from '@/components/oscrat/tasks/TaskStatusDropdown';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatTaskLabel } from '@/lib/tasks';
import { formatDateShort } from '@/utils/dateFormat';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface TaskTableProps {
  tasks: Task[];
  team: Team;
  onAddTask: () => void;
  onViewTask: (taskNumber: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusOptions: TaskStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  team,
  onAddTask,
  onViewTask,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}) => {
  const { t, ready } = useTranslation('common');
  const { members } = useTeamMembers(team.slug);

  const memberMap = useMemo(() => {
    const map = new Map();
    members?.forEach((member) => {
      map.set(member.userId, member.user.name);
    });
    return map;
  }, [members]);

  if (!ready) return null;

  const tableHeaders = [t('task'), t('due-date'), t('assignee'), t('status')];

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.tasks.title')}>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="status-filter"
            className="text-content text-sm font-medium"
          >
            {t('status')}
          </label>
          <div className="relative">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border-line bg-surface text-b2 text-content focus:border-primary rounded-input h-8 appearance-none border py-0 pl-2 pr-8 focus:outline-none"
            >
              <option value="All">{t('all')}</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {t(TASK_STATUS_TRANSLATION_MAP[opt])}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="text-content-placeholder pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
        </div>
        <TabActionButton onClick={onAddTask}>
          {t('oscrat.ui.add-task')}
        </TabActionButton>
      </TabHeader>

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader columns={tableHeaders.map((h) => ({ label: h }))} />
          <tbody className={tableStyles.tbody}>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-content-muted px-6 py-8 text-center"
                >
                  {t('no-tasks-yet')}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task.id}
                  onClick={() => onViewTask(task.taskNumber)}
                  className="hover:bg-surface-muted cursor-pointer transition-colors"
                >
                  <td className={tableStyles.td}>
                    <div className="font-medium">
                      {formatTaskLabel(task, t)}
                    </div>
                  </td>
                  <td className={tableStyles.td}>
                    {formatDateShort(task.duedate)}
                  </td>
                  <td className={tableStyles.td}>
                    {task.assigneeId
                      ? memberMap.get(task.assigneeId) || t('assigned')
                      : t('unassigned')}
                  </td>
                  <td
                    className={tableStyles.td}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskStatusDropdown task={task} team={team} />
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Index() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { versionId, productId } = useVersionContext();
  const { teamContext } = useTeamContext();
  const { team } = teamContext;

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [createTaskVisible, setCreateTaskVisible] = useState(false);

  const { tasks: allTasks, isLoading } = useTasks(team?.slug || '');

  // Filter tasks by versionId; newest first (higher taskNumber = more recent)
  const versionTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks
      .filter((task) => task.versionId === versionId)
      .sort((a, b) => b.taskNumber - a.taskNumber);
  }, [allTasks, versionId]);

  // Apply status filter
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'All') {
      return versionTasks;
    }
    return versionTasks.filter((task) => task.status === statusFilter);
  }, [versionTasks, statusFilter]);

  const allStatusOptions = Object.values(TaskStatus);

  const {
    currentPage,
    totalPages,
    pageData: paginatedTasks,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(filteredTasks, LISTING_PAGE_SIZE);

  // --- HANDLERS ---
  const handleAddTask = () => {
    setCreateTaskVisible(true);
  };

  const handleViewTask = (taskNumber: number) => {
    if (!team) return;
    router.push(
      `/organization/${team.slug}/products/${productId}/versions/${versionId}/task/${taskNumber}`
    );
  };

  if (!team || isLoading) {
    return (
      <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
        <div className="text-content-muted w-full py-8 text-center">
          {t('loading-tasks')}
        </div>
      </div>
    );
  }

  return (
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <TaskTable
          tasks={paginatedTasks}
          team={team}
          onAddTask={handleAddTask}
          onViewTask={handleViewTask}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={allStatusOptions}
        />
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            prevButtonDisabled={prevButtonDisabled}
            nextButtonDisabled={nextButtonDisabled}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            showItemCount
            totalItems={filteredTasks.length}
            itemsPerPage={LISTING_PAGE_SIZE}
          />
        )}
      </div>

      <CreateTask
        visible={createTaskVisible}
        setVisible={setCreateTaskVisible}
        team={team}
        defaultProductId={productId}
        defaultVersionId={versionId}
      />
    </div>
  );
}
