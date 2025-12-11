import React, { useMemo } from 'react';
import { OscratOrganizationSize, OscratOrganizationType, OscratOrganizationRole } from '@oscrat/model';
import { useFormik } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { teamCreationSchema } from '@/lib/validation/team';
import { useCreateTeam } from '@/lib/api';
import Select from '@atlaskit/select';
import countryList from 'react-select-country-list';
import { getCountryCallingCode } from 'libphonenumber-js';
import type { ApiError } from '@/types';

interface CreateTeamProps {
  onClose: () => void;
}

const CreateTeam = ({ onClose }: CreateTeamProps) => {
  const { t, ready } = useTranslation('common');
  const createTeam = useCreateTeam();

  const organizationSizeOptions = Object.values(OscratOrganizationSize).map(
    (size) => {
      const translationKeys: Record<string, string> = {
        MICRO_ENTERPRISE: 'oscrat.organization.sizes.micro-enterprise',
        SMALL_ENTERPRISE: 'oscrat.organization.sizes.small-enterprise',
        MEDIUM_ENTERPRISE: 'oscrat.organization.sizes.medium-enterprise',
        OTHER: 'oscrat.organization.sizes.other',
      };

      return {
        value: size,
        label: t(translationKeys[size] || size),
      };
    }
  );

  const countryOptions = useMemo(() => {
    return countryList()
      .getData()
      .filter((country) => {
        try {
          // Only include countries that have valid calling codes
          getCountryCallingCode(country.value as any);
          return true;
        } catch {
          return false;
        }
      });
  }, []);

  const formik = useFormik({
    initialValues: {
      type: OscratOrganizationType.NATURAL_PERSON,
      name: '',
      size: '',
      taxId: '',
      orgRole: OscratOrganizationRole.MANUFACTURER,
      postalAddress: '',
      contactEmail: '',
      contactPhone: '',
      countryCode: '',
      additionalInformation: '',
    },
    validationSchema: teamCreationSchema,
    onSubmit: async (values) => {
      try {
        const teamData = {
          name: values.name,
          type: values.type as OscratOrganizationType,
          orgRole: values.orgRole as OscratOrganizationRole,
          ...((values.type as OscratOrganizationType) ===
            OscratOrganizationType.LIMITED_LIABILITY_COMPANY && {
            size: values.size as OscratOrganizationSize,
            taxId: values.taxId,
          }),
          postalAddress: values.postalAddress,
          countryCode: values.countryCode,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          additionalInformation: values.additionalInformation,
        };

        await createTeam.mutateAsync(teamData);

        toast.success(t('team-created'));
        onClose();
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const handlePersonTypeChange = (type: OscratOrganizationType) => {
    formik.setFieldValue('type', type);
    // Clear fields that are not relevant for the selected type
    if (type === OscratOrganizationType.NATURAL_PERSON) {
      formik.setFieldValue('taxId', '');
      formik.setFieldValue('size', '');
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="mx-auto w-full">
      <form onSubmit={formik.handleSubmit}>
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
                  name="type"
                  value={OscratOrganizationType.NATURAL_PERSON}
                  checked={
                    formik.values.type === OscratOrganizationType.NATURAL_PERSON
                  }
                  onChange={() =>
                    handlePersonTypeChange(
                      OscratOrganizationType.NATURAL_PERSON
                    )
                  }
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {t('oscrat.ui.natural-person')}
                </span>
              </label>
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="type"
                  value={OscratOrganizationType.LIMITED_LIABILITY_COMPANY}
                  checked={
                    (formik.values.type as OscratOrganizationType) ===
                    OscratOrganizationType.LIMITED_LIABILITY_COMPANY
                  }
                  onChange={() =>
                    handlePersonTypeChange(
                      OscratOrganizationType.LIMITED_LIABILITY_COMPANY
                    )
                  }
                  className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {t('oscrat.ui.legal-person')}
                </span>
              </label>
            </div>
          </div>

          {/* Organization Role Dropdown */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('oscrat.ui.organization-role')}
            </label>
            <select
              name="orgRole"
              value={formik.values.orgRole}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.orgRole && formik.errors.orgRole
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            >
              {Object.values(OscratOrganizationRole).map((role) => (
                <option key={role} value={role}>
                  {t(`oscrat.organization.roles.${role.toLowerCase().replace(/_/g, '-')}`)}
                </option>
              ))}
            </select>
            {formik.values.orgRole && (
              <p className="mt-2 text-xs text-gray-600">
                {t(`oscrat.organization.roles.hints.${formik.values.orgRole.toLowerCase().replace(/_/g, '-')}`)}
              </p>
            )}
            {formik.touched.orgRole && formik.errors.orgRole && (
              <p className="mt-1 text-xs text-red-500">
                {t(formik.errors.orgRole)}
              </p>
            )}
          </div>

          {/* Legal Person Specific Fields */}
          {(formik.values.type as OscratOrganizationType) ===
            OscratOrganizationType.LIMITED_LIABILITY_COMPANY && (
            <div className="mb-4 space-y-4">
              <InputWithLabel
                type="text"
                name="name"
                placeholder={t('oscrat.ui.enter-organization-name')}
                value={formik.values.name}
                label={t('oscrat.ui.organization-name')}
                error={
                  formik.touched.name && formik.errors.name 
                    ? t(formik.errors.name) 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={30}
                required
              />

              {/* Tax ID */}
              <InputWithLabel
                type="text"
                name="taxId"
                placeholder="XX-XXXXXXX"
                value={formik.values.taxId}
                label={`${t('tax-id')} (${t('optional')})`}
                error={
                  formik.touched.taxId && formik.errors.taxId 
                    ? t(formik.errors.taxId) 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

              {/* Organization Size */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('oscrat.ui.organization-size')}
                </label>
                <select
                  name="size"
                  value={formik.values.size}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.size && formik.errors.size
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
                {formik.touched.size && formik.errors.size && (
                  <p className="mt-1 text-xs text-red-500">
                    {t(formik.errors.size)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Natural Person Specific Fields */}
          {(formik.values.type as OscratOrganizationType) ===
            OscratOrganizationType.NATURAL_PERSON && (
            <div className="mb-4 space-y-4">
              <InputWithLabel
                type="text"
                name="name"
                placeholder={t('oscrat.ui.enter-team-name')}
                value={formik.values.name}
                label={t('oscrat.ui.team-name')}
                error={
                  formik.touched.name && formik.errors.name 
                    ? t(formik.errors.name) 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
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
                formik.touched.postalAddress && formik.errors.postalAddress
                  ? t(formik.errors.postalAddress)
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={100}
              required
            />

            <InputWithLabel
              type="email"
              name="contactEmail"
              placeholder={t('email-placeholder')}
              value={formik.values.contactEmail}
              label={t('oscrat.ui.contact-email')}
              error={
                formik.touched.contactEmail && formik.errors.contactEmail
                  ? t(formik.errors.contactEmail)
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={100}
              required
            />

            {/* Phone Prefix Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('oscrat.ui.phone-prefix')}
              </label>
              <Select
                inputId="country-select"
                options={countryOptions}
                value={countryOptions.find(
                  (option) => option.value === formik.values.countryCode
                )}
                onChange={(selectedOption) => {
                  formik.setFieldValue(
                    'countryCode',
                    selectedOption?.value || ''
                  );
                }}
                onBlur={() => formik.setFieldTouched('countryCode', true)}
                placeholder={t('choose')}
                isSearchable
                className={
                  formik.touched.countryCode && formik.errors.countryCode
                    ? 'react-select-container [&_.react-select__control:hover]:border-red-500 [&_.react-select__control]:min-h-[42px] [&_.react-select__control]:border-red-500 [&_.react-select__control]:focus-within:border-red-500 [&_.react-select__control]:focus-within:ring-2 [&_.react-select__control]:focus-within:ring-red-500 [&_.react-select__control]:focus-within:ring-opacity-20'
                    : 'react-select-container [&_.react-select__control:hover]:border-gray-400 [&_.react-select__control]:min-h-[42px] [&_.react-select__control]:border-gray-300 [&_.react-select__control]:focus-within:border-blue-500 [&_.react-select__control]:focus-within:ring-2 [&_.react-select__control]:focus-within:ring-blue-500 [&_.react-select__control]:focus-within:ring-opacity-20'
                }
                classNamePrefix="react-select"
              />
              {formik.touched.countryCode && formik.errors.countryCode && (
                <p className="mt-1 text-xs text-red-500">
                  {t(formik.errors.countryCode)}
                </p>
              )}
            </div>

            {/* Phone Number with Country Code Prefix */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('oscrat.ui.contact-phone')}
              </label>
              <div className="flex">
                {/* Country Code Display */}
                <div className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-700">
                  {formik.values.countryCode
                    ? `+${getCountryCallingCode(formik.values.countryCode as any)}`
                    : '+XX'}
                </div>
                {/* Phone Number Input */}
                <input
                  type="tel"
                  name="contactPhone"
                  placeholder="123-4567-8901"
                  value={formik.values.contactPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`flex-1 rounded-r-md border border-l-0 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.contactPhone && formik.errors.contactPhone
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {formik.touched.contactPhone && formik.errors.contactPhone && (
                <p className="mt-1 text-xs text-red-500">
                  {t(formik.errors.contactPhone)}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('oscrat.ui.additional-info')}
              </label>
              <textarea
                name="additionalInformation"
                value={formik.values.additionalInformation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t('oscrat.ui.type-here')}
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 flex justify-between">
                <div>
                  {formik.touched.additionalInformation && formik.errors.additionalInformation && (
                    <p className="text-sm text-red-600" role="alert">
                      {t(formik.errors.additionalInformation)}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formik.values.additionalInformation.length}/500
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start space-x-3">
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              }
            }}
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
            {formik.isSubmitting ? t('oscrat.ui.creating') : t('create-team')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
