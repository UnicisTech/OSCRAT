import Button from '@/components/button';
import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { magicLinkSchema } from '@/lib/validation/auth';
import { useFormik } from 'formik';
import { useInvitation } from 'hooks/useInvitation';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

interface MagicLinkProps {
  csrfToken: string | undefined;
}

const MagicLink = ({ csrfToken }: MagicLinkProps) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const params = invitation ? `?token=${invitation.token}` : '';

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: magicLinkSchema,
    onSubmit: async (values) => {
      const response = await signIn('email', {
        email: values.email,
        csrfToken,
        redirect: false,
        callbackUrl,
      });

      formik.resetForm();

      if (response?.error) {
        toast.error(t('email-login-error'));
        return;
      }

      if (response?.status === 200 && response?.ok) {
        toast.success(t('email-login-success'));
        return;
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  return (
    <>
      <Head>
        <title>{t('magic-link-title')}</title>
      </Head>
      <div className="rounded border p-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder="email@unicis.tech"
              value={formik.values.email}
              descriptionText="We’ll email you a magic link for a password-free sign in."
              error={
                formik.touched.email && formik.errors.email
                  ? t(formik.errors.email)
                  : undefined
              }
              onChange={formik.handleChange}
            />
            <Button
              type="submit"
              variant="primary"
              loading={formik.isSubmitting}
              fullWidth
            >
              {t('send-magic-link')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link
            href={`/auth/login/${params}`}
            className="border-line text-content hover:bg-button-overlay rounded-input flex w-full items-center justify-center border px-4 py-2 font-medium no-underline transition-colors"
          >
            &nbsp;{t('sign-in-with-password')}
          </Link>
          <Link
            href="/auth/sso"
            className="border-line text-content hover:bg-button-overlay rounded-input flex w-full items-center justify-center border px-4 py-2 font-medium no-underline transition-colors"
          >
            &nbsp;{t('continue-with-saml-sso')}
          </Link>
        </div>
      </div>
      <p className="text-b2 text-content-secondary mt-3 text-center">
        {t('dont-have-an-account')}
        <Link
          href={`/auth/join${params}`}
          className="text-primary hover:text-info font-medium"
        >
          &nbsp;{t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

export default MagicLink;
