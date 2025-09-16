import React, { useState } from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useTranslation } from 'next-i18next';
import Header from '@/components/oscrat/shared/header';
import { CreateTask } from '@/components/interfaces/Task';
import TaskList from '@/components/oscrat/tasks/TaskList';
import useTasks from '@/hooks/useTasks';

const AllTasks = () => {
  const { teamContext } = useTeamContext();
  const { team, isLoading, isError } = teamContext;
  const { t, ready } = useTranslation('common');
  const [createTaskVisible, setCreateTaskVisible] = useState(false);

  if (isLoading) {
    return <div>{t('loading-project-details')}</div>;
  }

  if (isError || !team) {
    return <div>{t('team-not-found')}</div>;
  }

  const { tasks, isLoading: tasksLoading } = useTasks(team.slug);

  if (!ready) {
    return null;
  }

  return (
    <>
      <Header
        title={t('oscrat.ui.tasks')}
        subtitle={t('oscrat.ui.add-edit-review-tasks')}
        buttonText={t('oscrat.ui.add-task')}
        onButtonClick={() => setCreateTaskVisible(true)}
      />
      
      <div className="mt-6">
          <TaskList 
            tasks={tasks || []} 
            team={team}
            isLoading={tasksLoading}
          />
      </div>

      <CreateTask
        visible={createTaskVisible}
        setVisible={setCreateTaskVisible}
        team={team}
      />
    </>
  );
};

AllTasks.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default AllTasks;
