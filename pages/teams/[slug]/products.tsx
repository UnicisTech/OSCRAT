import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

const Products: NextPageWithLayout = () => {
  return (
    <div className="p-3">
      <p className="text-sm">
        This is just a placeholder for the products page.
      </p>
    </div>
  );
};

Products.getLayout = function getLayout(page: React.ReactNode) {
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
    },
  };
}

export default Products;
