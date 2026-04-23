import React from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { TeamTab } from '@/components/team';
import { Webhooks } from '@/components/webhook';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';

const WebhookList = ({ teamFeatures }) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  return (
    <>
      <TeamTab activeTab="webhooks" team={team} teamFeatures={teamFeatures} />
      <Webhooks team={team} />
    </>
  );
};

WebhookList.getLayout = withTeamLayout;

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.webhook) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default WebhookList;
