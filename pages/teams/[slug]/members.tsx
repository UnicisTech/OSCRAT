import { PendingInvitations } from '@/components/invitation';
import { Members, TeamTab } from '@/components/team';
import env from '@/lib/env';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

const TeamMembers = ({ teamFeatures }) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  return (
    <>
      <TeamTab activeTab="members" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <Members team={team} />
        <PendingInvitations team={team} />
      </div>
    </>
  );
};

TeamMembers.getLayout = function getLayout(page: React.ReactNode) {
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

export default TeamMembers;
