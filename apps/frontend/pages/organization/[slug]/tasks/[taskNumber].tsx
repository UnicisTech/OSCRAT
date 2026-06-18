import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useTask } from '@/hooks/useTask';
import { Breadcrumb } from '@/components/shared';
import {
  TaskDetailsForm,
  TaskDetailsTabs,
  RiskAssessmentSection,
} from '@/components/oscrat/tasks';
import { formatTaskLabel, resolveTaskTitle } from '@/lib/tasks';

const TaskDetails = () => {
  const router = useRouter();
  const { teamContext } = useTeamContext();
  const { team, isLoading: teamLoading, isError: teamError } = teamContext;
  const { t, ready } = useTranslation('common');

  // TODO: Create a task context
  const { taskNumber } = router.query;
  const taskNumberString = Array.isArray(taskNumber)
    ? taskNumber[0]
    : taskNumber;

  const {
    task,
    isLoading: taskLoading,
    isError: taskError,
  } = useTask(team?.slug || '', taskNumberString || '');

  if (teamLoading || !ready) {
    return <div>{t('loading-project-details')}</div>;
  }

  if (teamError || !team) {
    return <div>{t('team-not-found')}</div>;
  }

  if (taskLoading) {
    return <div>{t('loading-task-details')}</div>;
  }

  if (taskError || !task) {
    return <div>{t('task-not-found')}</div>;
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.tasks.title'),
      href: `/organization/${team.slug}/tasks`,
    },
    {
      label: resolveTaskTitle(task, t) ? formatTaskLabel(task, t) : t('task-details'),
      current: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Task Details Form */}
      <TaskDetailsForm task={task} team={team} />

      {/* Risk Assessment (enabled via checkbox) */}
      {(task.properties as Record<string, unknown>)?.enableRiskAssessment ===
        true && <RiskAssessmentSection task={task} team={team} />}

      {/* Tab Manager */}
      <TaskDetailsTabs task={task} team={team} />
    </div>
  );
};

TaskDetails.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TaskDetails;
