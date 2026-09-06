import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { useProductContext } from '@/context/ProductContext';
import { useVersionContext } from '@/context/VersionContext';
import { useTask } from '@/hooks/useTask';
import {
  TaskDetailsForm,
  TaskDetailsTabs,
  RiskAssessmentSection,
} from '@/components/oscrat/tasks';
import { Breadcrumb } from '@/components/shared';
import { Team, TaskType } from '@oscrat/model';
import { formatTaskLabel, resolveTaskTitle } from '@/lib/tasks';
// import TabsManager from '@/components/shared/TabsManager';
// import TABS_CONFIG from '@/components/oscrat/versions/versionDetails/tabs/allTabs/task/taskDetails/tabs';

interface TaskDetailsProps {
  taskNumber: string;
}

function TaskDetailsWithVersionContext({
  taskNumber,
  team,
}: {
  taskNumber: string;
  team: Team;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { productId: routeProductId, versionId: routeVersionId } =
    router.query as { productId: string; versionId: string };
  const { productContext } = useProductContext();
  const { versionContext } = useVersionContext();
  const { task, isLoading, isError } = useTask(team.slug, taskNumber);

  if (isLoading) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-content-muted text-center">
          {t('loading-task-details')}
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-danger text-center">{t('task-not-found')}</div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${team.slug}/products`,
    },
    {
      label: productContext.project?.name || '...',
      href: `/organization/${team.slug}/products/${routeProductId}`,
    },
    {
      label: versionContext.version?.version || '...',
      href: `/organization/${team.slug}/products/${routeProductId}/versions/${routeVersionId}`,
    },
    {
      label: resolveTaskTitle(task, t)
        ? formatTaskLabel(task, t)
        : t('task-details'),
      current: true,
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <TaskDetailsForm task={task} team={team} />
      {task.taskType === TaskType.RISK && (
        <RiskAssessmentSection task={task} team={team} />
      )}
      <TaskDetailsTabs task={task} team={team} />
    </div>
  );
}

function TaskDetailsStandalone({
  taskNumber,
  team,
}: {
  taskNumber: string;
  team: Team;
}) {
  const { t } = useTranslation('common');
  const { task, isLoading, isError } = useTask(team.slug, taskNumber);

  if (isLoading) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-content-muted text-center">
          {t('loading-task-details')}
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-danger text-center">{t('task-not-found')}</div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.tasks.title'),
      href: `/organization/${team.slug}/tasks`,
    },
    {
      label: resolveTaskTitle(task, t)
        ? formatTaskLabel(task, t)
        : t('task-details'),
      current: true,
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <TaskDetailsForm task={task} team={team} />
      {task.taskType === TaskType.RISK && (
        <RiskAssessmentSection task={task} team={team} />
      )}
      <TaskDetailsTabs task={task} team={team} />
    </div>
  );
}

export default function TaskDetails({ taskNumber }: TaskDetailsProps) {
  const router = useRouter();
  const { productId, versionId } = router.query as {
    productId?: string;
    versionId?: string;
  };
  const { teamContext } = useTeamContext();
  const { team } = teamContext as { team: Team };
  const { t } = useTranslation('common');

  if (!team) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-content-muted text-center">
          {t('loading-task-details')}
        </div>
      </div>
    );
  }

  if (productId && versionId) {
    return (
      <TaskDetailsWithVersionContext taskNumber={taskNumber} team={team} />
    );
  }

  return <TaskDetailsStandalone taskNumber={taskNumber} team={team} />;
}
