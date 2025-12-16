import React from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { AccessControl } from '@/components/shared/AccessControl';
import env from '@/lib/env';
import {
  RemoveTeam,
  TeamSettings,
  TeamTab,
  CSCSettings,
  ComplianceTranslationSettings,
} from '@/components/team';
import { useTeamContext } from '@/context/TeamContext';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Settings = ({ teamFeatures }) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  return (
    <>
      <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <TeamSettings team={team} />
        <CSCSettings team={team} />
        <ComplianceTranslationSettings team={team} />
        <AccessControl resource="team" actions={['delete']}>
          <RemoveTeam team={team} />
        </AccessControl>
      </div>
    </>
  );
};

Settings.getLayout = withTeamLayout;

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Settings;
