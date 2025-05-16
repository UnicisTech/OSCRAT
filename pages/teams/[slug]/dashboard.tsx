import { TeamCscAnalysis } from '@/components/interfaces/TeamDashboard';
import TasksAnalysis from '@/components/interfaces/TeamDashboard/TeamTasksAnalysis';
import env from '@/lib/env';
import { useTeamContext } from '@/context/TeamContext';
import { getCscStatusesBySlug } from 'models/team';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TeamLayout from '@/components/layouts/TeamLayout';
import React from 'react';
import AccountLayout from '@/components/layouts/AccountLayout';

const TeamDashboard = ({
  csc_statuses,
}: {
  teamFeatures: any;
  csc_statuses: { [key: string]: string };
}) => {
  const { t } = useTranslation('common');
  const { teamContext } = useTeamContext();

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('Team dashboard')} ({teamContext.team?.name})
        </h2>
      </div>
      <div className="space-y-6">
        <TasksAnalysis />
        <TeamCscAnalysis csc_statuses={csc_statuses} />
      </div>
    </>
  );
};

TeamDashboard.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      teamFeatures: env.teamFeatures,
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TeamDashboard;
