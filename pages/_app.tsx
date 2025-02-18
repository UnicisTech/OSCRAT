import { useState } from 'react';
import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';
import { ThemeProvider } from 'next-themes';

import { init } from '@socialgouv/matomo-next';

import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { Themer } from '@boxyhq/react-ui/shared';
import { AccountLayout } from '@/components/layouts';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const { session, ...props } = pageProps;
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (env.mixpanel.token) {
            mixpanel.init(env.mixpanel.token, {
                debug: true,
                ignore_dnt: true,
                track_pageview: true,
            });
        }

        // Add Matomo
        if (env.matomo.url && env.matomo.siteId) {
            init({ url: env.matomo.url, siteId: env.matomo.siteId });
        }
    }, []);

    // Password protection against bots scraping
    const handlePasswordSubmit = () => {
        const correctPassword = '123';
        if (password === correctPassword) {
            setIsPasswordCorrect(true);
        } else {
            alert('Incorrect password!');
        }
    };

    const getLayout =
        Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

    if (!isPasswordCorrect) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl mb-4">Enter Password to Continue</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 mb-4 w-full"
                        placeholder="Password"
                    />
                    <button
                        onClick={handlePasswordSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Submit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <Head>
                <title>{app.name}</title>
                <link rel="icon" href="https://www.unicis.tech/favicon.ico" />
            </Head>
            <SessionProvider session={session}>
                <Toaster toastOptions={{ duration: 4000 }} />
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
                    {getLayout(<Component {...props} />)}
                </Themer>
            </SessionProvider>
        </ThemeProvider>
    );
}

export default appWithTranslation<never>(MyApp);
