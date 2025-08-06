import { useTeamContext } from '@/context/TeamContext';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { withProductLayout } from '@/lib/layout-helpers';
import CompletedAppCheck from '@/components/oscrat/dashboard/CompletedAppCheck';
import TasksAndProducts from '@/components/oscrat/dashboard/TasksAndProducts';
import RecentActivities from '@/components/oscrat/dashboard/RecentActivities';

const TeamDashboard = () => {
  const { t } = useTranslation('common');
  const { teamContext } = useTeamContext();

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="mb-2 text-xl font-semibold">{t('Dashboard')}</h2>
      </div>
      <div className="space-y-6">
        <CompletedAppCheck />
        <TasksAndProducts />
        <RecentActivities />
      </div>
    </>
  );
};

TeamDashboard.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamDashboard;
