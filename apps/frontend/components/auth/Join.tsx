import { useState, useRef } from 'react';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import type { User } from '@oscrat/model';
import { OscratOrganizationSize } from '@oscrat/model';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const Join = ({ recaptchaSiteKey }: JoinProps) => {
  const router = useRouter();
  const { t, ready } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [personType, setPersonType] = useState<'natural' | 'legal'>('natural');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const organizationSizeOptions = Object.values(OscratOrganizationSize).map(
    (size) => {
      const labels: Record<string, string> = {
        MICROENTERPRISE: '1-10 employees',
        SMALL_ENTERPRISE: '11-50 employees',
        MEDIUM_ENTERPRISE: '51-200 employees',
        LARGE_ENTERPRISE: '201+ employees',
        STARTUP: 'Startup',
      };

      return {
        value: size,
        label: labels[size] || size,
      };
    }
  );

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      retypePassword: '',
      team: '',
      personType: 'natural' as 'natural' | 'legal',
      // Natural person fields
      postalAddress: '',
      contactEmail: '',
      contactPhone: '',
      additionalInformation: '',
      // Legal person fields
      organizationName: '',
      taxId: '',
      organizationSize: '',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string()
        .required('Email is required')
        .email('Must be a valid email'),
      password: Yup.string()
        .required('Password is required')
        .min(passwordPolicies.minLength),
      retypePassword: Yup.string()
        .required('Please retype your password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
      personType: Yup.string().oneOf(['natural', 'legal']).required(),
      // Conditional validation based on person type
      postalAddress: Yup.string().when('personType', {
        is: (val: string) => val === 'natural' || val === 'legal',
        then: (schema) => schema.required('Postal address is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      contactEmail: Yup.string().when('personType', {
        is: (val: string) => val === 'natural' || val === 'legal',
        then: (schema) =>
          schema
            .required('Contact email is required')
            .email('Must be a valid email'),
        otherwise: (schema) => schema.notRequired(),
      }),
      contactPhone: Yup.string().when('personType', {
        is: (val: string) => val === 'natural' || val === 'legal',
        then: (schema) => schema.required('Contact phone is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      additionalInformation: Yup.string().notRequired(),
      organizationName: Yup.string().when('personType', {
        is: 'legal',
        then: (schema) => schema.required('Organization name is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
      taxId: Yup.string().notRequired(),
      organizationSize: Yup.string().when('personType', {
        is: 'legal',
        then: (schema) => schema.required('Organization size is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const teamName =
          values.personType === 'legal'
            ? values.organizationName
            : `${values.firstName} ${values.lastName}'s Team`;

        const teamData = {
          name: teamName,
          type:
            values.personType === 'legal'
              ? 'LIMITED_LIABILITY_COMPANY'
              : 'NATURAL_PERSON',
          ...(values.personType === 'legal' && {
            size: values.organizationSize as any,
            taxId: values.taxId,
          }),
          postalAddress: values.postalAddress,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          additionalInformation: values.additionalInformation,
        };

        const response = await fetch('/api/auth/join', {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            team: teamName,
            teamData,
            recaptchaToken,
          }),
        });

        const json = (await response.json()) as ApiResponse<
          User & { confirmEmail: boolean }
        >;

        recaptchaRef.current?.reset();

        if (!response.ok) {
          toast.error(json.error.message);
          return;
        }

        formik.resetForm();

        if (json.data.confirmEmail) {
          router.push('/auth/verify-email');
        } else {
          toast.success(t('successfully-joined'));
          router.push('/auth/login');
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred during registration');
        recaptchaRef.current?.reset();
      }
    },
  });

  const handlePersonTypeChange = (type: 'natural' | 'legal') => {
    setPersonType(type);
    formik.setFieldValue('personType', type);
    if (type === 'natural') {
      formik.setFieldValue('organizationName', '');
      formik.setFieldValue('taxId', '');
      formik.setFieldValue('organizationSize', '');
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form onSubmit={formik.handleSubmit}>
        {/* User Information Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t('oscrat.ui.user-information')}
          </h2>

          <div className="space-y-4">
            {/* First Name and Last Name in a row */}
            <div className="grid grid-cols-2 gap-4">
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
              />
            </div>

            {/* Email */}
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
            />

            {/* Password and Retype Password in a row */}
            <div className="grid grid-cols-2 gap-4">
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
              />
            </div>
          </div>
        </div>

        {/* Organization Information Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t('oscrat.ui.organization-information')}
          </h2>

          {/* Organization Type Radio Buttons */}
          <div className="mb-6">
            <label className="mb-4 block text-sm font-medium text-gray-700">
              {t('oscrat.ui.organization-type')}:
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="personType"
                  value="natural"
                  checked={personType === 'natural'}
                  onChange={() => handlePersonTypeChange('natural')}
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {t('oscrat.ui.natural-person')}
                </span>
              </label>
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="personType"
                  value="legal"
                  checked={personType === 'legal'}
                  onChange={() => handlePersonTypeChange('legal')}
                  className="focus:ring-black! h-4 w-4 border-gray-300 text-black"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {t('oscrat.ui.legal-person')}
                </span>
              </label>
            </div>
          </div>

          {/* Legal Person Specific Fields */}
          {personType === 'legal' && (
            <div className="mb-4 space-y-4">
              <InputWithLabel
                type="text"
                name="organizationName"
                placeholder={t('oscrat.ui.enter-organization-name')}
                value={formik.values.organizationName}
                label={t('oscrat.ui.organization-name')}
                error={
                  formik.touched.organizationName
                    ? formik.errors.organizationName
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputWithLabel
                  type="text"
                  name="taxId"
                  placeholder="XX-XXXXXXX"
                  value={formik.values.taxId}
                  label={`${t('tax-id')} (${t('optional')})`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('oscrat.ui.organization-size')}
                  </label>
                  <select
                    name="organizationSize"
                    value={formik.values.organizationSize}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formik.touched.organizationSize &&
                      formik.errors.organizationSize
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">{t('choose')}</option>
                    {organizationSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formik.touched.organizationSize &&
                    formik.errors.organizationSize && (
                      <p className="mt-1 text-xs text-red-500">
                        {formik.errors.organizationSize}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Common Fields for both Natural and Legal Person */}
          <div className="space-y-4">
            <InputWithLabel
              type="text"
              name="postalAddress"
              placeholder={t('address')}
              value={formik.values.postalAddress}
              label={t('oscrat.ui.postal-address')}
              error={
                formik.touched.postalAddress
                  ? formik.errors.postalAddress
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                type="email"
                name="contactEmail"
                placeholder={t('email-placeholder')}
                value={formik.values.contactEmail}
                label={t('oscrat.ui.contact-email')}
                error={
                  formik.touched.contactEmail
                    ? formik.errors.contactEmail
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />

              <InputWithLabel
                type="tel"
                name="contactPhone"
                placeholder="123-4567-8901"
                value={formik.values.contactPhone}
                label={t('oscrat.ui.contact-phone')}
                error={
                  formik.touched.contactPhone
                    ? formik.errors.contactPhone
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('oscrat.ui.additional-info')}
              </label>
              <textarea
                name="additionalInformation"
                value={formik.values.additionalInformation}
                onChange={formik.handleChange}
                placeholder={t('oscrat.ui.type-here')}
                rows={3}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onClick={() => router.push('/auth/login')}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
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

export default Join;
