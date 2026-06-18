import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import Button from '@/components/button';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { userSignupSchema } from '@/lib/validation/signup';
import { useJoin } from '@/hooks/useJoin';
import { handleAuthError } from '@/lib/errorHandler';
import AgreeMessage from '@/components/auth/AgreeMessage';
import type { ApiError } from '@/types';

interface SignupProps {
  recaptchaSiteKey: string | null;
}

const Signup = ({ recaptchaSiteKey }: SignupProps) => {
  const router = useRouter();
  const { t, ready } = useTranslation('common');
  const { join } = useJoin();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      retypePassword: '',
    },
    validationSchema: userSignupSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      if (recaptchaSiteKey && !recaptchaToken) {
        toast.error(t('oscrat.ui.catpcha-verification-failed'));
        return;
      }

      try {
        // Register user
        await join({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          recaptchaToken,
        });

        // Automatically sign in the user
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        recaptchaRef.current?.reset();
        formik.resetForm();

        if (result?.error) {
          const message = handleAuthError(result.error);
          // `confirm-your-email` is a successful account creation that simply
          // requires email verification before logging in, so show it as a
          // success confirmation rather than an error.
          if (result.error === 'confirm-your-email') {
            toast.success(message);
          } else {
            toast.error(message);
          }
          router.push('/auth/login');
        } else {
          toast.success(t('successfully-joined'));
          router.push('/organization');
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
        recaptchaRef.current?.reset();
      }
    },
  });

  if (!ready) {
    return null;
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

            {/* Email Row */}
            <InputWithLabel
              type="email"
              name="email"
              placeholder={t('email-placeholder')}
              value={formik.values.email}
              label={t('email')}
              error={
                formik.touched.email && formik.errors.email
                  ? t(formik.errors.email)
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              autoComplete="email"
            />

            {/* Password and Retype Password Row */}
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              router.push('/auth/login');
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
          >
            {formik.isSubmitting
              ? t('oscrat.ui.creating')
              : t('create-account')}
          </Button>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-4">
          <AgreeMessage text="create-account" />
        </div>
      </form>
    </div>
  );
};

export default Signup;
