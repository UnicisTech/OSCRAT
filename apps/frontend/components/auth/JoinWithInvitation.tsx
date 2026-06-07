import { Error, InputWithLabel, Loading } from '@/components/shared';
import { joinWithInvitationSchema } from '@/lib/validation/auth';
import { useFormik } from 'formik';
import { useInvitation } from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useRef, useState } from 'react';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { extractErrorMessage } from '@/lib/utils';
import { useJoin } from '@/hooks/useJoin';
import { signIn } from 'next-auth/react';
import AgreeMessage from '@/components/auth/AgreeMessage';

interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

const JoinWithInvitation = ({
  inviteToken,
  recaptchaSiteKey,
}: JoinWithInvitationProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, error, invitation } = useInvitation(inviteToken);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { join } = useJoin();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
      retypePassword: '',
    },
    validationSchema: joinWithInvitationSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        if (!invitation) {
          toast.error(t('oscrat.ui.invitation-not-found'));
          return;
        }

        // Create the account
        await join({
          firstName: values.firstName,
          lastName: values.lastName,
          email: invitation.email,
          password: values.password,
          recaptchaToken,
        });

        recaptchaRef.current?.reset();
        formik.resetForm();
        toast.success(t('successfully-joined'));

        await signIn('credentials', {
          email: invitation.email,
          password: values.password,
          redirect: true,
          callbackUrl: `/organization?token=${inviteToken}`,
        });
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('oscrat.ui.error-joining')));
        recaptchaRef.current?.reset();
      }
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return (
      <Error message={error?.message || t('oscrat.ui.invitation-not-found')} />
    );
  }

  return (
    <div className="mx-auto w-full">
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-6">
          <div className="space-y-4">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputWithLabel
                type="text"
                name="firstName"
                placeholder={t('your-first-name')}
                value={formik.values.firstName}
                label={t('first-name')}
                error={
                  formik.touched.firstName && formik.errors.firstName
                    ? t(formik.errors.firstName)
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                autoComplete="given-name"
              />

              <InputWithLabel
                type="text"
                name="lastName"
                placeholder={t('your-last-name')}
                value={formik.values.lastName}
                label={t('last-name')}
                error={
                  formik.touched.lastName && formik.errors.lastName
                    ? t(formik.errors.lastName)
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                autoComplete="family-name"
              />
            </div>

            {/* Email Row (locked to the invited address) */}
            <InputWithLabel
              type="email"
              name="email"
              placeholder={t('email-placeholder')}
              value={invitation.email}
              label={t('email')}
              onChange={formik.handleChange}
              disabled
              autoComplete="email"
            />

            {/* Password and Confirm Password Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputWithLabel
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formik.values.password}
                label={t('password')}
                error={
                  formik.touched.password && formik.errors.password
                    ? t(formik.errors.password)
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                autoComplete="new-password"
              />

              <InputWithLabel
                type="password"
                name="retypePassword"
                placeholder="••••••••••••"
                value={formik.values.retypePassword}
                label={t('confirm-password')}
                error={
                  formik.touched.retypePassword && formik.errors.retypePassword
                    ? t(formik.errors.retypePassword)
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {/* ReCAPTCHA */}
        <div className="mb-6">
          <GoogleReCAPTCHA
            recaptchaRef={recaptchaRef}
            onChange={setRecaptchaToken}
            siteKey={recaptchaSiteKey}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start space-x-3">
          <button
            type="button"
            onClick={() => {
              router.push('/auth/login');
            }}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
            className={`rounded-md px-6 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              formik.isSubmitting || !formik.isValid || !formik.dirty
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {formik.isSubmitting
              ? t('oscrat.ui.creating')
              : t('create-account')}
          </button>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-4">
          <AgreeMessage text="create-account" />
        </div>
      </form>
    </div>
  );
};

export default JoinWithInvitation;
