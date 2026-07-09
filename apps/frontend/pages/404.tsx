import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { AuthLayout } from '@/components/layouts';
import type { NextPageWithLayout } from 'types';

const Custom404: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('page-not-found')}</title>
      </Head>
      <div className="rounded border p-6 text-center">
        <p className="text-content-secondary text-sm font-semibold">404</p>
        <h1 className="text-content mt-2 text-2xl font-bold">
          {t('page-not-found')}
        </h1>
        <p className="text-content-secondary mt-3">
          {t('page-not-found-description')}
        </p>
        <Link
          href="/auth/login"
          className="bg-button-primary text-content-inverse hover:bg-button-primary-hover focus-visible:ring-primary mt-6 inline-flex rounded-input px-4 py-2 font-medium focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
        >
          {t('go-to-home')}
        </Link>
      </div>
    </>
  );
};

Custom404.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Custom404;
