'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

// Form handling
import { useFormik } from 'formik';

// Context & Hooks
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';

// API endpoints
import { oscratVersionEndpoints } from '@/lib/api/endpoints/oscrat/versions';

// Models & Types
import { OscratProductType, OscratProductVersionStatus } from '@oscrat/model';
import type { OscratProductCreate, OscratProductVersionCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Components
import { InputWithLabel } from '@/components/shared';

// Utils & Validation
import { cacheProductSchema, type CacheProductData } from '@/lib/validation/product';
import { loadFormState, clearFormState, getProductCategoryFromRisk } from '@/utils/craForm';
import normalizeText from '@/utils/normalizeText';
import type { FormState } from '@/types/craForm';

// External libraries
import toast from 'react-hot-toast';

// Layout
import { withTeamLayout } from '@/lib/layout-helpers';

export default function Cache() {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const [formState, setFormState] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { createProject, isLoading: isCreatingProject } = useOscratProject(teamId, '', { enabled: false });

  // Load cached form state on mount
  useEffect(() => {
    const cachedState = loadFormState();
    if (cachedState?.completed && cachedState?.highestRiskLevel && cachedState?.answers) {
      setFormState(cachedState as FormState);
    }
  }, []);

  const formik = useFormik<CacheProductData>({
    initialValues: {
      acronym: '',
      name: '',
      version: '',
      description: '',
    },
    validationSchema: cacheProductSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        if (!session?.user?.id) {
          toast.error(t('oscrat.ui.validation.user-information-not-available'));
          return;
        }

        if (!formState?.highestRiskLevel) {
          toast.error(t('oscrat.ui.validation.no-cached-risk-assessment'));
          return;
        }

        setIsLoading(true);
        
        const productData: OscratProductCreate = {
          // TODO: uncomment when added to DB:  acronym: values.acronym.trim(),
          name: values.name.trim(),
          type: OscratProductType.APPLICATION_SOFTWARE, // Default type since it's required in DB schema, Radu, please make optional in schema
          productCategory: getProductCategoryFromRisk(formState.highestRiskLevel),
          createdBy: session.user.id,
          description: values.description?.trim(),
        };

        const createdProduct = await createProject(productData);
        
        const versionData: OscratProductVersionCreate = {
          version: values.version.trim(),
          status: OscratProductVersionStatus.ACTIVE,
          productId: createdProduct.id,
          createdBy: session.user.id,
        };

         // EXCEPTION: Using the API endpoint directly with the created product ID, 
        // as an exception, since the hook is not available without a product ID
        await oscratVersionEndpoints.createVersion(teamId, createdProduct.id, versionData);

        toast.success(t('oscrat.ui.validation.product-created-successfully'));
        
        clearFormState();

        // 1 second delay before replacing the page
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.replace(`/teams/${teamId}/products/${createdProduct.id}`);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleRetakeSurvey = () => {
    router.push(`/teams/${teamId}/form`);
  };

  const handleBack = () => {
    router.back();
  };

  const formatCompletedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (!ready) return null;

  const isFormLoading = isLoading || isCreatingProject;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-[20px] font-semibold text-gray-800">
            {t('oscrat.ui.validation.provide-initial-information')}
          </h1>
        </div>

        {/* Content Section */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-6">
            {/* Two-column info row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Cached Applicability Check */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-500">
                  {t('oscrat.ui.cached-applicability-check')}
                </h3>
                <p className="text-sm font-bold text-black">
                  {t('oscrat.ui.applicability-check')} - {formState?.completedAt ? formatCompletedDate(formState.completedAt) : t('oscrat.ui.not-available')}
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-500">
                  {t('oscrat.ui.category')}
                </h3>
                <p className="text-sm font-bold text-black">
                  {formState?.highestRiskLevel ? normalizeText(formState.highestRiskLevel) : t('oscrat.ui.not-available')}
                </p>
              </div>
            </div>

            {/* Retake Survey Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleRetakeSurvey}
                className="rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('oscrat.ui.retake-survey')}
              </button>
            </div>

            {/* Form inputs */}
            <div className="space-y-4">
              {/* Product Acronym */}
              <InputWithLabel
                type="text"
                name="acronym"
                placeholder={t('oscrat.ui.validation.product-acronym-placeholder')}
                value={formik.values.acronym}
                label={`${t('oscrat.ui.product-acronym')} *`}
                error={
                  formik.touched.acronym && formik.errors.acronym 
                    ? formik.errors.acronym 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isFormLoading}
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
                    ? formik.errors.name 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isFormLoading}
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
                    ? formik.errors.version 
                    : undefined
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isFormLoading}
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
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isFormLoading}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formik.errors.description}
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
              disabled={isFormLoading}
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={isFormLoading || !formik.isValid || !formik.dirty || !formState?.highestRiskLevel}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isFormLoading ? t('loading') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Cache.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
