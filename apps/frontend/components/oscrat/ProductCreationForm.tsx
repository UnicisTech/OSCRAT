'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { FormikProps } from 'formik';
import { InputWithLabel } from '@/components/shared';
import { useTeamContext } from '@/context/TeamContext';

interface ProductFormValues {
  acronym: string;
  name: string;
  version: string;
  description?: string;
}

interface ProductCreationFormProps<T extends ProductFormValues = ProductFormValues> {
  formik: FormikProps<T>;
  isLoading: boolean;
  additionalFields?: ReactNode;
  submitDisabled?: boolean;
  headerTitle?: string;
}

export default function ProductCreationForm<T extends ProductFormValues = ProductFormValues>({
  formik,
  isLoading,
  additionalFields,
  submitDisabled,
  headerTitle,
}: ProductCreationFormProps<T>) {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug: teamId } = useTeamContext();

  const handleBack = () => {
    router.push(`/organization/${teamId}/products/add-product`);
  };

  if (!ready) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-[20px] font-semibold text-gray-800">
            {headerTitle || t('oscrat.ui.validation.provide-initial-information')}
          </h1>
        </div>

        {/* Content Section */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-6">
            <div className="space-y-4">
              {/* Additional fields rendered at the top */}
              {additionalFields}

              {/* Product Acronym */}
              <InputWithLabel
                type="text"
                name="acronym"
                placeholder={t('oscrat.ui.validation.product-acronym-placeholder')}
                value={formik.values.acronym}
                label={`${t('oscrat.ui.product-acronym')} *`}
                error={
                  formik.touched.acronym && formik.errors.acronym 
                    ? t(String(formik.errors.acronym))
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
                maxLength={10}
                required
              />

              {/* Product Name */}
              <InputWithLabel
                type="text"
                name="name"
                placeholder={t('oscrat.ui.validation.enter-product-name-placeholder')}
                value={formik.values.name}
                label={`${t('oscrat.ui.product-name')} *`}
                error={
                  formik.touched.name && formik.errors.name 
                    ? t(String(formik.errors.name))
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
                maxLength={40}
                required
              />

              {/* Product Version */}
              <InputWithLabel
                type="text"
                name="version"
                placeholder={t('oscrat.ui.validation.product-version-placeholder')}
                value={formik.values.version}
                label={`${t('oscrat.ui.product-version')} *`}
                error={
                  formik.touched.version && formik.errors.version 
                    ? t(String(formik.errors.version))
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isLoading}
                maxLength={20}
                required
              />

              {/* Product Short Description */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('oscrat.ui.product-short-description')}
                </label>
                <textarea
                  name="description"
                  placeholder={t('oscrat.ui.validation.brief-description-placeholder')}
                  value={formik.values.description || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {t(String(formik.errors.description))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex pl-6 items-center justify-start space-x-3 rounded-b-lg border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={submitDisabled ?? (isLoading || !formik.isValid || !formik.dirty)}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? t('oscrat.ui.loading') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

