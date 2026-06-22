'use client';

// React
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

// Form handling
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

// Context & Hooks
import { useTeamContext } from '@/context/TeamContext';
import { useGetProducts } from '@/lib/api/hooks/oscrat/projects';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useCreateAssessment } from '@/lib/api/hooks/oscrat/assessments';
import { oscratAssessmentEndpoints } from '@/lib/api/endpoints/oscrat/assessments';

// Models & Types
import {
  OscratProductType,
  OscratProductCategory,
  OscratProductVersionStatus,
  OscratAssessmentType,
} from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Components
import Button from '@/components/button';
import { SelectWithLabel } from '@/components/shared';
import ProductCreationForm from '@/components/oscrat/ProductCreationForm';

// Utils
import { getProductCategoryKey } from '@/utils/translation';
import { createExistingProductSchema } from '@/lib/validation/product';
import { withTeamLayout } from '@/lib/layout-helpers';

export default function Existing() {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const { data: existingProducts } = useGetProducts(teamId);
  const { createProject, isLoading: isCreatingProject } = useOscratProject(
    teamId,
    '',
    { enabled: false }
  );
  const createAssessmentMutation = useCreateAssessment(teamId);

  // Create validation schema with uniqueness check
  const validationSchema = useMemo(
    () => createExistingProductSchema(existingProducts),
    [existingProducts]
  );

  const formik = useFormik({
    initialValues: {
      sourceProductId: '',
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
        const userId = session?.user?.id;

        if (!userId) {
          toast.error(t('oscrat.ui.validation.user-information-not-available'));
          return;
        }

        if (!selectedProduct) {
          toast.error(t('oscrat.ui.validation.please-select-source-product'));
          return;
        }

        const productData: OscratProductCreate = {
          name: values.name.trim(),
          acronym: values.acronym.trim(),
          type: selectedProduct.type as OscratProductType,
          productCategory:
            selectedProduct.productCategory as OscratProductCategory,
          createdBy: userId,
          description: values.description?.trim(),
          initialVersion: {
            version: values.version.trim(),
            status: OscratProductVersionStatus.ACTIVE,
          },
        };

        const createdProduct = await createProject(productData);

        // Copy the source product's applicability survey (latest CRA assessment)
        // to the new product so the user can view/continue it instead of starting
        // a fresh survey. Failure here is non-fatal — surface a warning and let
        // the user retake the survey on the new product if needed.
        try {
          const sourceAssessments =
            await oscratAssessmentEndpoints.findAssessments(teamId, {
              productId: values.sourceProductId,
            });
          const latestCra = sourceAssessments
            .filter((a) => a.type === OscratAssessmentType.CRA)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0];

          if (latestCra) {
            const sourceDetail =
              await oscratAssessmentEndpoints.getAssessmentDetail(
                teamId,
                latestCra.id
              );
            await createAssessmentMutation.mutateAsync({
              type: OscratAssessmentType.CRA,
              schemaVersion: sourceDetail.schemaVersion,
              rawData: sourceDetail.rawData,
              productId: createdProduct.id,
              createdBy: userId,
            });
          }
        } catch (surveyErr) {
          console.error('Failed to copy source survey:', surveyErr);
          toast.error(t('oscrat.ui.validation.failed-to-copy-survey'));
        }

        toast.success(t('oscrat.ui.validation.product-copied-successfully'));

        // 1 second delay before replacing the page
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.replace(`/organization/${teamId}/products/${createdProduct.id}`);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const selectedProduct =
    existingProducts?.find((p) => p.id === formik.values.sourceProductId) ??
    null;

  const isLoading = isCreatingProject || createAssessmentMutation.isPending;

  const productOptions = [
    { value: '', label: t('choose') },
    ...(existingProducts || []).map((product) => ({
      value: product.id,
      label: product.name,
    })),
  ];

  const handleSourceProductChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const productId = e.target.value;
    formik.setFieldValue('sourceProductId', productId);
  };

  if (!ready) return null;

  if (!existingProducts || existingProducts.length === 0) {
    return (
      <div className="flex w-full justify-center">
        <div className="border-line bg-surface rounded-card w-full max-w-2xl border">
          <div className="p-10">
            <h1 className="text-content mb-4 text-[20px] font-semibold">
              {t('oscrat.ui.no-existing-products')}
            </h1>
            <p className="text-content-secondary mb-6 text-sm">
              {t('oscrat.ui.no-existing-products-description')}
            </p>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(`/organization/${teamId}/products/add-product`)
                }
              >
                {t('back')}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push(`/organization/${teamId}/form`)}
              >
                {t('oscrat.ui.take-survey')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const additionalFields = (
    <>
      {/* Source Product Dropdown */}
      <SelectWithLabel
        name="sourceProductId"
        value={formik.values.sourceProductId}
        label={`${t('oscrat.ui.source-product')} *`}
        error={
          formik.touched.sourceProductId && formik.errors.sourceProductId
            ? t(formik.errors.sourceProductId)
            : undefined
        }
        onChange={handleSourceProductChange}
        onBlur={formik.handleBlur}
        disabled={isLoading || formik.isSubmitting}
        required
        options={productOptions}
      />

      {/* Category */}
      <div className="w-full">
        <label className="text-content-secondary mb-2 block text-sm font-medium">
          {t('oscrat.ui.category')}
        </label>
        <div className="text-content-secondary w-full rounded-md px-1 py-2">
          {selectedProduct
            ? t(getProductCategoryKey(selectedProduct.productCategory))
            : '-'}
        </div>
      </div>
    </>
  );

  return (
    <ProductCreationForm
      formik={formik}
      isLoading={isLoading || formik.isSubmitting}
      additionalFields={additionalFields}
      submitDisabled={
        isLoading || formik.isSubmitting || !formik.isValid || !formik.dirty
      }
      headerTitle={t('oscrat.ui.validation.provide-initial-information')}
    />
  );
}

Existing.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
