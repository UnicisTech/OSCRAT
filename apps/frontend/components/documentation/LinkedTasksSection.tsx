import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import { XMarkIcon, LinkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateTask } from '@/components/interfaces/Task';
import { TaskStatus, type TeamDetail } from '@oscrat/model';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { useLinkedTasks } from './hooks/useLinkedTasks';

interface LinkedTask {
  taskId: number;
  taskNumber: number;
  title: string;
  status: string;
}

interface AvailableTask {
  id: number;
  taskNumber: number;
  title: string;
}

interface LinkedTasksSectionProps {
  slug: string;
  linkedTasks: LinkedTask[] | undefined;
  availableTasks: AvailableTask[] | undefined;
  canEdit: boolean;
  isPublic: boolean;
  team: TeamDetail | undefined;
  defaultProductId?: string;
  defaultVersionId?: string;
  onLinkTask: (taskId: number) => Promise<unknown>;
  onUnlinkTask: (taskId: number) => Promise<unknown>;
  isLinking?: boolean;
  isUnlinking?: boolean;
}

const LinkedTasksSection: React.FC<LinkedTasksSectionProps> = ({
  slug,
  linkedTasks,
  availableTasks,
  canEdit,
  isPublic,
  team,
  defaultProductId,
  defaultVersionId,
  onLinkTask,
  onUnlinkTask,
  isLinking = false,
  isUnlinking = false,
}) => {
  const { t } = useTranslation('common');

  const {
    selectedTaskId,
    setSelectedTaskId,
    createTaskVisible,
    setCreateTaskVisible,
    filteredAvailableTasks,
    handleLinkTask,
    handleUnlinkTask,
    handleTaskCreatedAndLink,
  } = useLinkedTasks({
    linkedTasks,
    availableTasks,
    onLinkTask,
    onUnlinkTask,
  });

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          {t('oscrat.ui.documentation.linked-tasks')}
        </h3>
      </div>

      {canEdit && (
        <div className="flex items-end gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('oscrat.ui.documentation.link-task')}
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full h-8 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={!filteredAvailableTasks || filteredAvailableTasks.length === 0}
            >
              <option value="">
                {filteredAvailableTasks && filteredAvailableTasks.length > 0
                  ? t('oscrat.ui.documentation.select-task')
                  : t('oscrat.ui.documentation.no-tasks-available')}
              </option>
              {filteredAvailableTasks?.map((task) => (
                <option key={task.id} value={task.id}>
                  #{task.taskNumber}: {task.title}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            color="primary"
            onClick={handleLinkTask}
            loading={isLinking}
            className="h-8"
          >
            {t('oscrat.ui.documentation.link-button')}
          </Button>
          <Button
            size="sm"
            color="success"
            variant="outline"
            onClick={() => setCreateTaskVisible(true)}
            className="flex items-center gap-1 h-8"
            disabled={isLinking}
          >
            <PlusIcon className="h-4 w-4" />
            {t('oscrat.ui.documentation.new-task')}
          </Button>
        </div>
      )}

      {linkedTasks && linkedTasks.length > 0 ? (
        <div className="space-y-2">
          {linkedTasks.map((task) => (
            <div
              key={task.taskId}
              className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <a
                href={`/organization/${slug}/tasks/${task.taskNumber}`}
                className="text-blue-600 hover:underline"
              >
                #{task.taskNumber}: {task.title}
                <span className="ml-2 text-sm text-gray-500">
                  ({t(getTaskStatusTranslationKey(task.status as TaskStatus))})
                </span>
              </a>
              {canEdit && (
                <button
                  onClick={() => handleUnlinkTask(task.taskId)}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('oscrat.ui.documentation.unlink-task')}
                  disabled={isUnlinking}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          {t('oscrat.ui.documentation.no-linked-tasks')}
        </p>
      )}

      {isPublic && (
        <p className="mt-4 text-xs text-amber-600">
          {t('oscrat.ui.documentation.backlinks-hidden-public')}
        </p>
      )}

      {team && (
        <CreateTask
          visible={createTaskVisible}
          setVisible={setCreateTaskVisible}
          team={team}
          defaultProductId={defaultProductId}
          defaultVersionId={defaultVersionId}
          onSuccess={handleTaskCreatedAndLink}
        />
      )}
    </div>
  );
};

export default LinkedTasksSection;
