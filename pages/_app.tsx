import { useState, useEffect } from 'react';
import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors';
import type { AppPropsWithLayout } from 'types';
// import mixpanel from 'mixpanel-browser';
// import { init } from '@socialgouv/matomo-next';
import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from '@/utils/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
// import env from '@/lib/env';
import { Themer } from '@boxyhq/react-ui/shared';
import AccountLayout from '@/components/layouts/AccountLayout';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [password, setPassword] = useState('');

  // useEffect(() => {
  //   if (env.mixpanel.token) {
  //     mixpanel.init(env.mixpanel.token, {
  //       debug: true,
  //       ignore_dnt: true,
  //       track_pageview: true,
  //     });
  //   }
  //
  //   // Add Matomo
  //   if (env.matomo.url && env.matomo.siteId) {
  //     init({ url: env.matomo.url, siteId: env.matomo.siteId });
  //   }
  // }, []);

  // Password protection against bots scraping
  const PASSWORD_ACCESS_KEY = 'passwordAccessGrantedUntil';
  const ACCESS_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  useEffect(() => {
    const storedExpiryTime = localStorage.getItem(PASSWORD_ACCESS_KEY);
    if (storedExpiryTime) {
      if (Date.now() < parseInt(storedExpiryTime, 10)) {
        setIsPasswordCorrect(true);
      } else {
        localStorage.removeItem(PASSWORD_ACCESS_KEY);
      }
    }
  }, []);

  const handlePasswordSubmit = () => {
    const correctPassword = '123';
    if (password === correctPassword) {
      // Calculate expiry time (current time + 1 hour)
      const expiryTime = Date.now() + ACCESS_DURATION_MS;
      localStorage.setItem(PASSWORD_ACCESS_KEY, expiryTime.toString());
      setIsPasswordCorrect(true);
    } else {
      alert('Incorrect password!');
    }
  };

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  const pageWithLayout = getLayout(<Component {...props} />);

  if (!isPasswordCorrect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-xl">Enter Password to Continue</h2>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full border p-2"
            placeholder="Password"
          />
          <button
            onClick={handlePasswordSubmit}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

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
