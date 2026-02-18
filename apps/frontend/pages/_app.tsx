import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors';
import type { AppPropsWithLayout } from 'types';
import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from '@/utils/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
import '@mdxeditor/editor/style.css';
import { Themer } from '@boxyhq/react-ui/shared';
import AccountLayout from '@/components/layouts/AccountLayout';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  const getLayout =
    Component.getLayout || ((page) => {
      return <AccountLayout>{page}</AccountLayout>;
    });

  const pageWithLayout = getLayout(<Component {...props} />);

  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Head>
          <title>{app.name}</title>
          <link rel="icon" href="https://www.unicis.tech/favicon.ico" />
        </Head>
        <SessionProvider session={session}>
          <Toaster toastOptions={{ duration: 4000 }} />
          <ReactQueryDevtools initialIsOpen={false} />
          <Themer
            overrideTheme={{
              '--primary-color': colors.blue['500'],
              '--primary-hover': colors.blue['600'],
              '--primary-color-50': colors.blue['50'],
              '--primary-color-100': colors.blue['100'],
              '--primary-color-200': colors.blue['200'],
              '--primary-color-300': colors.blue['300'],
              '--primary-color-500': colors.blue['500'],
              '--primary-color-600': colors.blue['600'],
              '--primary-color-700': colors.blue['700'],
              '--primary-color-800': colors.blue['800'],
              '--primary-color-900': colors.blue['900'],
              '--primary-color-950': colors.blue['950'],
            }}
          >
            {pageWithLayout}
          </Themer>
        </SessionProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

export default appWithTranslation<never>(MyApp);
