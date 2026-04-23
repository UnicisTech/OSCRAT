'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

// Form handling
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useGetProducts } from '@/lib/api/hooks/oscrat/projects';
import { useCreateAssessment } from '@/lib/api/hooks/oscrat/assessments';

// Models & Types
import { OscratProductType, OscratProductVersionStatus, OscratAssessmentType } from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Utils
import { createCacheProductSchema, type CacheProductData } from '@/lib/validation/product';
import { getProductCategoryFromRisk, transformFormStateToAssessmentData, loadFormState, clearFormState } from '@/utils/craForm';
import { oscratProductCategoryTranslationMap } from '@/utils/translation';
import type { FormState } from '@/types/craForm';
import { withTeamLayout } from '@/lib/layout-helpers';

// Components
import ProductCreationForm from '@/components/oscrat/ProductCreationForm';

export default function Cache() {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const [formState, setFormState] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { createProject, isLoading: isCreatingProject } = useOscratProject(teamId, '', { enabled: false});
  const { data: existingProducts } = useGetProducts(teamId);
  const createAssessmentMutation = useCreateAssessment(teamId);

  // Create validation schema with uniqueness check
  const validationSchema = useMemo(
    () => createCacheProductSchema(existingProducts),
    [existingProducts]
  );

  // Load form state from localStorage on mount
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
    validationSchema,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
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
          name: values.name.trim(),
          acronym: values.acronym.trim(),
          type: OscratProductType.APPLICATION_SOFTWARE,
          productCategory: getProductCategoryFromRisk(formState.highestRiskLevel),
          createdBy: session.user.id,
          description: values.description?.trim(),
          initialVersion: {
            version: values.version.trim(),
            status: OscratProductVersionStatus.ACTIVE,
          },
        };

        const createdProduct = await createProject(productData);

        // Save CRA assessment to DB if form state exists
        if (formState && createdProduct.versions && createdProduct.versions.length > 0) {
          // Verify formState has answers before saving
          if (!formState.answers || Object.keys(formState.answers).length === 0) {
            console.error('FormState missing answers!', formState);
            toast.error(t('oscrat.ui.validation.no-answers-to-save'));
            setIsLoading(false);
            return;
          }

          // Transform form state to assessment data - this includes ALL answers
          const rawData = transformFormStateToAssessmentData(formState);
          
          try {
            // Create assessment synchronously before navigating
            await createAssessmentMutation.mutateAsync({
              type: OscratAssessmentType.CRA,
              schemaVersion: '1.0.0',
              rawData: rawData,
              productId: createdProduct.id,
              createdBy: session.user.id,
            });
            
            // Clear localStorage only after successful assessment creation
            clearFormState();
            toast.success(t('oscrat.ui.assessment-saved-successfully'));
          } catch (assessmentError) {
            console.error('Failed to save CRA assessment:', assessmentError);
            toast.error(t('oscrat.ui.failed-to-save-assessment'));
            // Don't clear localStorage if assessment save fails - user can retry from product page
          }
        } else {
          // No assessment to save, clear localStorage
          clearFormState();
        }
        
        toast.success(t('oscrat.ui.validation.product-created-successfully'));
        router.replace(`/organization/${teamId}/products/${createdProduct.id}`);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleRetakeSurvey = () => {
    router.push(`/organization/${teamId}/form`);
  };

  const formatCompletedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (!ready) return null;

  if (!formState || !formState.highestRiskLevel) {
    return (
      <div className="flex w-full justify-center">
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md">
          <div className="p-10">
            <h1 className="text-[20px] font-semibold text-gray-800 mb-4">
              {t('oscrat.ui.no-cached-survey')}
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {t('oscrat.ui.no-cached-survey-description')}
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/organization/${teamId}/products/add-product`)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('back')}
              </button>
              <button
                type="button"
                onClick={handleRetakeSurvey}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('oscrat.ui.take-survey')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormLoading = isLoading || isCreatingProject || createAssessmentMutation.isPending;

  const additionalFields = (
    <>
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
            {formState?.highestRiskLevel
              ? t(oscratProductCategoryTranslationMap[getProductCategoryFromRisk(formState.highestRiskLevel)])
              : t('oscrat.ui.not-available')}
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
    </>
  );

  return (
    <ProductCreationForm
      formik={formik}
      isLoading={isFormLoading}
      additionalFields={additionalFields}
      submitDisabled={isFormLoading || !formik.isValid || !formik.dirty || !formState?.highestRiskLevel}
    />
  );
}

Cache.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
