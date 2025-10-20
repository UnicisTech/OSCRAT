import React, { type ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticPropsContext } from 'next';
import { BsExclamationTriangle } from 'react-icons/bs';
import { Loading } from '@/components/shared';
import SidePanel from '@/components/shared/SidePanel';
import type { NextPageWithLayout } from 'types';

const NotFoundLayout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    return (
      <div className="flex h-screen">
        <SidePanel />
        <main className="flex-1 bg-white py-10 text-black dark:bg-black dark:text-white overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <main className="bg-white py-10 text-black dark:bg-black dark:text-white min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
    </main>
  );
};

const Custom404: NextPageWithLayout = () => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const homeUrl = isAuthenticated ? '/teams' : '/';

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(homeUrl);
    }
  };

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>404 - {t('oscrat.ui.page-not-found')}</title>
      </Head>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <BsExclamationTriangle className="h-24 w-24 text-yellow-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {t('oscrat.ui.page-not-found')}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t('oscrat.ui.page-not-found-description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleGoBack}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('oscrat.ui.go-back')}
            </button>

            <Link
              href={homeUrl}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('oscrat.ui.go-to-home')}
            </Link>

            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('sign-in')}
                </Link>
                <Link
                  href="/auth/join"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t('sign-up')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Custom404.getLayout = function getLayout(page: ReactElement) {
  return <NotFoundLayout>{page}</NotFoundLayout>;
};

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Custom404;

