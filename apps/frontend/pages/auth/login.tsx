import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { type ReactElement, useEffect, useState, useRef } from 'react';
import type { AlertStatus as ComponentStatus } from '@/components/shared/Alert';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import Head from 'next/head';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { emailSchema } from '@/lib/validation/inputs';
import { getSession } from '@/lib/session';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
  csrfToken,
  authProviders,
  recaptchaSiteKey,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { error, success, token, email } = router.query as {
    error: string;
    success: string;
    token: string;
    email: string;
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/organization?token=${token}`
    : env.redirectIfAuthenticated;

  //TODO: should delete this
  // if (status === 'authenticated') {
  //   router.push('/');
  // }

  // if (status === "authenticated") {
  //   router.push(redirectAfterSignIn || '/organization');
  // }

  const handleStartForm = () => {
    router.push('/form');
  };

  const formik = useFormik({
    initialValues: {
      email: email || '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: emailSchema.required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      const response = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectUrl,
        recaptchaToken,
      });

      formik.resetForm();
      recaptchaRef.current?.reset();

      if (!response?.ok) {
        toast.error(t(response?.error));
        return;
      }

      // Redirect after successful login
      if (response?.ok) {
        router.push(redirectUrl);
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('login-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert status={message.status}>{t(message.text)}</Alert>
      )}
      <div className="rounded border p-6">
        {authProviders?.credentials && (
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-3">
              <InputWithLabel
                type="email"
                label="Email"
                labelStyle="font-semibold text-content"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                error={
                  formik.touched.email && formik.errors.email
                    ? t(formik.errors.email)
                    : undefined
                }
                onChange={formik.handleChange}
              />
              <div className="relative flex">
                <InputWithLabel
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  label={
                    <label className="label">
                      <span className="label-text text-content font-semibold">
                        Password
                      </span>
                      <span className="label-text-alt">
                        <Link
                          href="/auth/forgot-password"
                          className="hover:text-primary-focus text-primary-light text-sm"
                        >
                          {t('forgot-password')}
                        </Link>
                      </span>
                    </label>
                  }
                  error={
                    formik.touched.password && formik.errors.password
                      ? t(formik.errors.password)
                      : undefined
                  }
                  onChange={formik.handleChange}
                />
                <TogglePasswordVisibility
                  isPasswordVisible={isPasswordVisible}
                  handlePasswordVisibility={handlePasswordVisibility}
                />
              </div>
              <GoogleReCAPTCHA
                recaptchaRef={recaptchaRef}
                onChange={setRecaptchaToken}
                siteKey={recaptchaSiteKey}
              />
            </div>
            <div className="mt-3 space-y-3">
              <Button
                type="submit"
                disabled={!formik.dirty}
                variant="primary"
                text={t('sign-in')}
                fullWidth
              />
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleStartForm();
                }}
                variant="secondary"
                text={t('applicability-check')}
                fullWidth
                type="button"
              />
              <AgreeMessage text="sign-in" />
            </div>
          </form>
        )}

        {/* {(authProviders.email || authProviders.saml) && (
          <div className="divider"></div>
        )} */}

        {/* <div className="space-y-3">
          {authProviders.email && (
            <Link
              href={`/auth/magic-link${params}`}
              className="border-line bg-surface text-content block w-full rounded-input border px-2 py-3 text-center text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
            >
              &nbsp;{t('sign-in-with-email')}
            </Link>
          )}

          {authProviders.saml && (
            <Link
              href="/auth/sso"
              className="border-line bg-surface text-content hover:bg-surface-muted block w-full rounded-input border px-2 py-3 text-center text-sm font-medium transition-colors duration-200"
            >
              &nbsp;{t('continue-with-saml-sso')}
            </Link>
          )}
        </div> */}
      </div>
      <p className="text-content-secondary mt-3 text-center text-sm font-semibold">
        {t('dont-have-an-account')}&nbsp;
        <Link
          href={`/auth/join${params}`}
          className="hover:text-primary-focus text-primary font-medium underline"
        >
          {t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="Welcome" description="Log in to your account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, req, res, query } = context;
  const session = await getSession(req, res);

  if (session) {
    const token = query.token as string | undefined;
    const destination = token
      ? `/invitations/${token}`
      : env.redirectIfAuthenticated;
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: (await getCsrfToken(context)) || null,
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
