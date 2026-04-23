import React from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { PendingInvitations } from '@/components/invitation';
import { Members, TeamTab } from '@/components/team';
import env from '@/lib/env';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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

TeamMembers.getLayout = withTeamLayout;

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

export default TeamMembers;
