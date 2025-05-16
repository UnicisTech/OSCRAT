import APIKeysContainer from '@/components/apiKey/APIKeysContainer';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

const APIKeys = ({ teamFeatures }) => {
  return <APIKeysContainer teamFeatures={teamFeatures} />;
};

APIKeys.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.apiKey) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ["common"]) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default APIKeys;
