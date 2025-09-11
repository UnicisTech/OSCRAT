import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { userSignupSchema } from '@/lib/validation/signup';
import { useJoin } from '@/hooks/useJoin';
import { handleApiError, handleAuthError } from '@/lib/errorHandler';
import type { ApiError } from '@/types';

interface SignupProps {
  recaptchaSiteKey: string | null;
  onClose?: () => void;
}

const Signup = ({ recaptchaSiteKey, onClose }: SignupProps) => {
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
          const errorMessage = handleAuthError(result.error);
          toast.error(errorMessage);
          router.push('/auth/login');
        } else {
          toast.success(t('successfully-joined'));
          router.push('/teams');
        }
      } catch (error: unknown) {
        const errorMessage = handleApiError(error as ApiError);
        toast.error(errorMessage);
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
                  formik.touched.firstName ? formik.errors.firstName : undefined
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
                  formik.touched.lastName ? formik.errors.lastName : undefined
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
              error={formik.touched.email ? formik.errors.email : undefined}
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
                  formik.touched.password ? formik.errors.password : undefined
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
                label={t('retype-password')}
                error={
                  formik.touched.retypePassword
                    ? formik.errors.retypePassword
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
              formik.isSubmitting || !formik.isValid
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
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {t('agree-message-part', { button: t('create-account') })}{' '}
            <a href="#" className="text-blue-600 hover:underline">
              {t('terms')}
            </a>
            , {t('privacy')} {t('and')}{' '}
            <a href="#" className="text-blue-600 hover:underline">
              {t('security')}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
