import { AccessControl } from '@/components/shared/AccessControl';
import env from '@/lib/env';
import {
  RemoveTeam,
  TeamSettings,
  TeamTab,
  CSCSettings,
} from '@/components/team';
import { useTeamContext } from '@/context/TeamContext';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

const Settings = ({ teamFeatures }) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  return (
    <>
      <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <TeamSettings team={team} />
        <CSCSettings team={team} />
        <AccessControl resource="team" actions={["delete"]}>
          <RemoveTeam team={team} />
        </AccessControl>
      </div>
    </>
  );
};

Settings.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default Settings;
