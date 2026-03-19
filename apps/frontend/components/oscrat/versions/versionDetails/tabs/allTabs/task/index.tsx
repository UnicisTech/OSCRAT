import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { TabHeader, TableWrapper, TableHeader, TableRow, TabActionButton } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { TaskStatus } from '@oscrat/model';
import type { Task, Team } from '@oscrat/model';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import useTasks from '@/hooks/useTasks';
import { TASK_STATUS_TRANSLATION_MAP } from '@/constants/taskStatuses';
import { CreateTask } from '@/components/interfaces/Task';
import TaskStatusDropdown from '@/components/oscrat/tasks/TaskStatusDropdown';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';

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
    members?.forEach(member => {
      map.set(member.userId, member.user.name);
    });
    return map;
  }, [members]);
  
  if (!ready) return null;

  const tableHeaders = [
    t('task'),
    t('due-date'),
    t('assignee'),
    t('status'),
  ];

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.tasks.title')}>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-900"
          >
            {t('status')}
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">{t('all')}</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {t(TASK_STATUS_TRANSLATION_MAP[opt])}
              </option>
            ))}
          </select>
        </div>
        <TabActionButton onClick={onAddTask}>
          {t('oscrat.ui.add-task')}
        </TabActionButton>
      </TabHeader>

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader
            columns={tableHeaders.map((h) => ({ label: h }))}
          />
          <tbody className={tableStyles.tbody}>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {t('no-tasks-yet')}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TableRow 
                  key={task.id}
                  onClick={() => onViewTask(task.taskNumber)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className={tableStyles.td}>
                    <div className="font-medium">
                      {task.title}
                    </div>
                  </td>
                  <td className={tableStyles.td}>
                    {new Date(task.duedate).toLocaleDateString()}
                  </td>
                  <td className={tableStyles.td}>
                    {task.assigneeId 
                      ? (memberMap.get(task.assigneeId) || t('assigned'))
                      : t('unassigned')}
                  </td>
                  <td className={tableStyles.td} onClick={(e) => e.stopPropagation()}>
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

  // Filter tasks by versionId
  const versionTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter(task => task.versionId === versionId);
  }, [allTasks, versionId]);

  // Apply status filter
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'All') {
      return versionTasks;
    }
    return versionTasks.filter((task) => task.status === statusFilter);
  }, [versionTasks, statusFilter]);

  const allStatusOptions = Object.values(TaskStatus);

  const ITEMS_PER_PAGE = 10;
  const {
    currentPage,
    totalPages,
    pageData: paginatedTasks,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(filteredTasks, ITEMS_PER_PAGE);

  // --- HANDLERS ---
  const handleAddTask = () => {
    setCreateTaskVisible(true);
  };

  const handleViewTask = (taskNumber: number) => {
    if (!team) return;
    router.push(
      `/teams/${team.slug}/products/${productId}/versions/${versionId}/task/${taskNumber}`
    );
  };

  if (!team || isLoading) {
    return (
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
        <div className="w-full py-8 text-center text-gray-500">{t('loading-tasks')}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
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
            itemsPerPage={ITEMS_PER_PAGE}
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
