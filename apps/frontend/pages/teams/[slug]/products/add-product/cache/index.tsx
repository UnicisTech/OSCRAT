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
import { OscratProductType, OscratProductVersionStatus } from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Utils
import { cacheProductSchema, type CacheProductData } from '@/lib/validation/product';
import { loadFormState, clearFormState, getProductCategoryFromRisk } from '@/utils/craForm';
import normalizeText from '@/utils/normalizeText';
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

        toast.success(t('oscrat.ui.validation.product-created-successfully'));
        
        clearFormState();
        
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

  const isFormLoading = isLoading || isCreatingProject;

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
