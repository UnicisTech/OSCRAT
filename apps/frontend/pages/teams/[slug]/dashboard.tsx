import { useTranslation } from 'next-i18next';
import React, { useState, useEffect } from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import CompletedAppCheck from '@/components/oscrat/dashboard/CompletedAppCheck';
import TasksAndProducts from '@/components/oscrat/dashboard/TasksAndProducts';
import RecentActivities from '@/components/oscrat/dashboard/RecentActivities';

const TeamDashboard = () => {
  const { t } = useTranslation('common');
  const [completedFormData, setCompletedFormData] = useState<{
    completed: boolean;
    riskLevel: string;
  } | null>(null);

  const shouldShowCompletedAppCheck = completedFormData?.completed && completedFormData.riskLevel;

  useEffect(() => {
    const savedState = localStorage.getItem('craFormState');
    if (!savedState) return;

    try {
      const parsed = JSON.parse(savedState);
      if (parsed.completed && parsed.highestRiskLevel) {
        setCompletedFormData({
          completed: true,
          riskLevel: parsed.highestRiskLevel
        });
      }
    } catch (error) {
      console.error("Failed to parse saved state:", error);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="mb-2 text-xl font-semibold">{t('Dashboard')}</h2>
      </div>
      <div className="space-y-6">
        {shouldShowCompletedAppCheck && (
          <CompletedAppCheck riskLevel={completedFormData.riskLevel} />
        )}
        <TasksAndProducts />
        <RecentActivities />
      </div>
    </>
  );
};

TeamDashboard.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamDashboard;
