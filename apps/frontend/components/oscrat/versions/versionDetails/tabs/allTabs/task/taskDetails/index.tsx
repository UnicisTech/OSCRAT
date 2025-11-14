import React from 'react';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { useTask } from '@/hooks/useTask';
import { TaskDetailsForm } from '@/components/oscrat/tasks';
import { Task, Team } from '@oscrat/model';
// import TabsManager from '@/components/shared/TabsManager';
// import TABS_CONFIG from '@/components/oscrat/versions/versionDetails/tabs/allTabs/task/taskDetails/tabs';

interface TaskDetailsProps {
  taskNumber: string;
}

export default function TaskDetails({ taskNumber }: TaskDetailsProps) {
  const { t } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { team } = teamContext as { team: Team };

  const { task, isLoading, isError } = useTask(team.slug, taskNumber);

  if (!team || isLoading) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-center text-gray-500">{t('loading-task-details')}</div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col p-4">
        <div className="text-center text-red-500">{t('task-not-found')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <TaskDetailsForm task={task} team={team} />
      {/*<TabsManager tabs={TABS_CONFIG} />*/}
    </div>
  );
}
