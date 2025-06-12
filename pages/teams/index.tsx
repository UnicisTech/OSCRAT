import { Teams } from '@/components/team';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import React from 'react';
import AccountLayout from '@/components/layouts/AccountLayout';

const AllTeams: NextPageWithLayout = () => {
  return <Teams />;
};

AllTeams.getLayout = function getLayout(page: React.ReactNode) {
  return <AccountLayout>{page}</AccountLayout>;
};

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default AllTeams;
