import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors';
import type { AppPropsWithLayout } from 'types';
import { useEffect } from 'react';
import { setGlobalTheme } from '@atlaskit/tokens';
import { ReactQueryProvider } from '@/utils/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
import '@mdxeditor/editor/style.css';
import { Themer } from '@boxyhq/react-ui/shared';
import AccountLayout from '@/components/layouts/AccountLayout';

/**
 * Mounts the @atlaskit/tokens CSS variables in light mode. Atlaskit components
 * (textfield, select, dropdown-menu, modal) read these tokens — they do NOT
 * read Tailwind. Brand colours are overridden to the OSCRAT blue via `--ds-*`
 * rules in globals.css. The app is light-only.
 */
function AtlaskitThemeSync() {
  useEffect(() => {
    setGlobalTheme({ colorMode: 'light' });
  }, []);

  return null;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  const getLayout =
    Component.getLayout ||
    ((page) => {
      return <AccountLayout>{page}</AccountLayout>;
    });

  const pageWithLayout = getLayout(<Component {...props} />);

  return (
    <ReactQueryProvider>
      <Head>
        <title>{app.name}</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <SessionProvider session={session}>
        <AtlaskitThemeSync />
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
    </ReactQueryProvider>
  );
}

export default appWithTranslation<never>(MyApp);
