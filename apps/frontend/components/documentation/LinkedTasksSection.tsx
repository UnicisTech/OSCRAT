import React from 'react';
import { useTranslation } from 'next-i18next';
import { XMarkIcon, LinkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/shared';
import { CreateTask } from '@/components/interfaces/Task';
import { TaskStatus, type TeamDetail } from '@oscrat/model';
import { getTaskStatusTranslationKey } from '@/constants/taskStatuses';
import { resolveTaskTitle } from '@/lib/tasks';
import { useLinkedTasks } from './hooks/useLinkedTasks';

interface LinkedTask {
  taskId: number;
  taskNumber: number;
  title: string;
  titleLocId?: string | null;
  status: string;
}

interface AvailableTask {
  id: number;
  taskNumber: number;
  title: string;
  titleLocId?: string | null;
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
    <div className="border-line bg-surface rounded-card border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-medium">
          <LinkIcon className="h-5 w-5" />
          {t('oscrat.ui.documentation.linked-tasks')}
        </h3>
      </div>

      {canEdit && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-content-secondary mb-1 block text-sm font-medium">
              {t('oscrat.ui.documentation.link-task')}
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="border-line focus:border-primary focus:ring-primary rounded-input h-8 w-full border px-3 text-sm focus:outline-none focus:ring-1"
              disabled={
                !filteredAvailableTasks || filteredAvailableTasks.length === 0
              }
            >
              <option value="">
                {filteredAvailableTasks && filteredAvailableTasks.length > 0
                  ? t('oscrat.ui.documentation.select-task')
                  : t('oscrat.ui.documentation.no-tasks-available')}
              </option>
              {filteredAvailableTasks?.map((task) => (
                <option key={task.id} value={task.id}>
                  #{task.taskNumber}: {resolveTaskTitle(task, t)}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="m"
            variant="primary"
            onClick={handleLinkTask}
            loading={isLinking}
            disabled={
              isLinking ||
              !filteredAvailableTasks ||
              filteredAvailableTasks.length === 0
            }
            className="h-8"
          >
            {t('oscrat.ui.documentation.link-button')}
          </Button>
          <Button
            size="m"
            variant="secondary"
            onClick={() => setCreateTaskVisible(true)}
            className="h-8"
            disabled={isLinking}
            startIcon={<PlusIcon className="h-4 w-4" />}
          >
            {t('oscrat.ui.documentation.new-task')}
          </Button>
        </div>
      )}

      {linkedTasks && linkedTasks.length > 0 ? (
        <div className="space-y-2">
          {linkedTasks.map((task) => (
            <div
              key={task.taskId}
              className="bg-surface-muted border-line-subtle rounded-input flex items-center justify-between border px-3 py-2"
            >
              <a
                href={`/organization/${slug}/tasks/${task.taskNumber}`}
                className="text-primary hover:underline"
              >
                #{task.taskNumber}: {resolveTaskTitle(task, t)}
                <span className="text-content-muted ml-2 text-sm">
                  ({t(getTaskStatusTranslationKey(task.status as TaskStatus))})
                </span>
              </a>
              {canEdit && (
                <Button
                  variant="tertiary"
                  tone="danger"
                  size="m"
                  onClick={() => handleUnlinkTask(task.taskId)}
                  title={t('oscrat.ui.documentation.unlink-task')}
                  disabled={isUnlinking}
                  icon={<XMarkIcon className="h-5 w-5" />}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-content-muted text-sm italic">
          {t('oscrat.ui.documentation.no-linked-tasks')}
        </p>
      )}

      {isPublic && (
        <p className="text-warning mt-4 text-xs">
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
