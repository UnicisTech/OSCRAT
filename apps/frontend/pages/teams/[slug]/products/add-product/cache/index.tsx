'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

// Form handling
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';

// Models & Types
import { OscratProductType, OscratProductVersionStatus, OscratAssessmentType } from '@oscrat/model';
import type { OscratProductCreate, OscratAssessmentCreateRequest } from '@oscrat/model';
import type { ApiError } from '@/types';

// Utils
import { cacheProductSchema, type CacheProductData } from '@/lib/validation/product';
import { getProductCategoryFromRisk, transformFormStateToAssessmentData, loadFormState, clearFormState } from '@/utils/craForm';
import normalizeText from '@/utils/normalizeText';
import type { FormState } from '@/types/craForm';
import { withTeamLayout } from '@/lib/layout-helpers';

// Components
import ProductCreationForm from '@/components/oscrat/ProductCreationForm';
import { useAssessments } from '@/hooks/oscrat/useOscratAssessment';

export default function Cache() {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const [formState, setFormState] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAssessment, setPendingAssessment] = useState<{
    productId: string;
    versionId: string;
    data: OscratAssessmentCreateRequest;
  } | null>(null);
  const [assessmentSaveInitiated, setAssessmentSaveInitiated] = useState(false);

  const { createProject, isLoading: isCreatingProject } = useOscratProject(teamId, '', { enabled: false});
  
  // Create assessment hook - enabled when we have pending assessment
  const { createAssessment, isLoading: isCreatingAssessment } = useAssessments(
    teamId,
    { productId: pendingAssessment?.productId, versionId: pendingAssessment?.versionId },
    { enabled: !!pendingAssessment }
  );

 useEffect(() => {
    if (pendingAssessment && !assessmentSaveInitiated && !isCreatingAssessment && pendingAssessment.productId && pendingAssessment.versionId) {
      setAssessmentSaveInitiated(true);
      const assessmentPromise = createAssessment(pendingAssessment.data);
      assessmentPromise
        .then(() => {
          // Clear localStorage only after successful product AND assessment creation
          clearFormState();
          setPendingAssessment(null);
          setAssessmentSaveInitiated(false);
          toast.success(t('oscrat.ui.assessment-saved-successfully'));
        })
        .catch((error) => {
          console.error('Failed to save CRA assessment:', {
            error,
            productId: pendingAssessment.productId,
            versionId: pendingAssessment.versionId,
            data: pendingAssessment.data,
          });
          toast.error(t('oscrat.ui.failed-to-save-assessment'));
          // Don't clear localStorage if assessment save fails - user can retry
          setPendingAssessment(null);
          setAssessmentSaveInitiated(false);
        });
    }
  }, [pendingAssessment, assessmentSaveInitiated, isCreatingAssessment, t]);

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
          name: values.name.trim(),
          acronym: values.acronym.trim(),
          type: OscratProductType.APPLICATION_SOFTWARE, // Default type since it's required in DB schema, Radu, please make optional in schema
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
        // IMPORTANT: Ensure all answers are saved in the assessment
        if (formState && createdProduct.versions && createdProduct.versions.length > 0) {
          const versionId = createdProduct.versions[0].id;
          
          // Verify formState has answers before saving
          if (!formState.answers || Object.keys(formState.answers).length === 0) {
            console.error('FormState missing answers!', formState);
            toast.error(t('oscrat.ui.validation.no-answers-to-save'));
            setIsLoading(false);
            return;
          }

          // Transform form state to assessment data - this includes ALL answers
          const rawData = transformFormStateToAssessmentData(formState);
          
          // Queue assessment creation - useEffect will handle it
          setPendingAssessment({
            productId: createdProduct.id,
            versionId,
            data: {
              type: OscratAssessmentType.CRA,
              schemaVersion: '1.0.0',
              rawData: rawData,
              productId: createdProduct.id,
              createdBy: session.user.id,
            },
          });
        } else {
          // No assessment to save, clear localStorage
          clearFormState();
        }

        // Note: localStorage will be cleared by useEffect after assessment is saved
        // If assessment save fails, localStorage remains so user can retry
        
        toast.success(t('oscrat.ui.validation.product-created-successfully'));
        
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

  const formatCompletedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (!ready) return null;

  const isFormLoading = isLoading || isCreatingProject || isCreatingAssessment;

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
