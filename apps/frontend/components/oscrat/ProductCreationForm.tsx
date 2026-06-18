'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { FormikProps } from 'formik';
import { InputWithLabel } from '@/components/shared';
import Button from '@/components/button';
import { useTeamContext } from '@/context/TeamContext';

interface ProductFormValues {
  acronym: string;
  name: string;
  version: string;
  description?: string;
}

interface ProductCreationFormProps<
  T extends ProductFormValues = ProductFormValues,
> {
  formik: FormikProps<T>;
  isLoading: boolean;
  additionalFields?: ReactNode;
  submitDisabled?: boolean;
  headerTitle?: string;
}

export default function ProductCreationForm<
  T extends ProductFormValues = ProductFormValues,
>({
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
      <div className="border-line bg-surface rounded-card w-full max-w-2xl border">
        {/* Header Section */}
        <div className="border-line-subtle border-b p-6">
          <h1 className="text-content text-[20px] font-semibold">
            {headerTitle ||
              t('oscrat.ui.validation.provide-initial-information')}
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
                placeholder={t(
                  'oscrat.ui.validation.product-acronym-placeholder'
                )}
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
                placeholder={t(
                  'oscrat.ui.validation.enter-product-name-placeholder'
                )}
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
                placeholder={t(
                  'oscrat.ui.validation.product-version-placeholder'
                )}
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
                <label className="text-content-secondary mb-2 block text-sm font-medium">
                  {t('oscrat.ui.product-short-description')}
                </label>
                <textarea
                  name="description"
                  placeholder={t(
                    'oscrat.ui.validation.brief-description-placeholder'
                  )}
                  value={formik.values.description || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                  maxLength={500}
                  rows={3}
                  className="border-line text-content-secondary placeholder-content-placeholder shadow-2 focus:border-primary focus:ring-primary disabled:bg-surface-muted disabled:text-content-muted rounded-input w-full border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-danger mt-1 text-sm" role="alert">
                    {t(String(formik.errors.description))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="border-line-subtle flex items-center justify-start space-x-3 rounded-b-lg border-t p-4 pl-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              {t('back')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                submitDisabled ??
                (isLoading || !formik.isValid || !formik.dirty)
              }
            >
              {isLoading ? t('oscrat.ui.loading') : t('create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
