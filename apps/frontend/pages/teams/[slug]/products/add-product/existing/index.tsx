'use client';

// React
import React from 'react';
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

// Models & Types
import { OscratProductType, OscratProductCategory, OscratProductVersionStatus } from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Components
import { SelectWithLabel } from '@/components/shared';
import ProductCreationForm from '@/components/oscrat/ProductCreationForm';

// Utils
import { getProductCategoryKey } from '@/utils/translation';
import { existingProductSchema } from '@/lib/validation/product';
import { withTeamLayout } from '@/lib/layout-helpers';

export default function Existing() {
  const { t, ready } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const { data: existingProducts } = useGetProducts(teamId);
  const { createProject, isLoading: isCreatingProject } = useOscratProject(teamId, '', { enabled: false });

  const formik = useFormik({
    initialValues: {
      sourceProductId: '',
      acronym: '',
      name: '',
      version: '',
      description: '',
    },
    validationSchema: existingProductSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        if (existingProducts?.some(
          (product) => product.name.toLowerCase() === values.name.trim().toLowerCase()
        )) {
          toast.error(t('oscrat.ui.validation.product-name-already-exists'));
          return;
        }

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
          productCategory: selectedProduct.productCategory as OscratProductCategory,
          createdBy: userId,
          description: values.description?.trim(),
          initialVersion: {
            version: values.version.trim(),
            status: OscratProductVersionStatus.ACTIVE,
          },
        };

        const createdProduct = await createProject(productData);

        toast.success(t('oscrat.ui.validation.product-copied-successfully'));

        // 1 second delay before replacing the page
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.replace(`/teams/${teamId}/products/${createdProduct.id}`);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message);
      }
    },
  });

  const selectedProduct = existingProducts?.find(
    (p) => p.id === formik.values.sourceProductId
  ) ?? null;

  const isLoading = isCreatingProject;

  const productOptions = [
    { value: '', label: t('choose') },
    ...(existingProducts || []).map(product => ({
      value: product.id,
      label: product.name
    }))
  ];

  const handleSourceProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    formik.setFieldValue('sourceProductId', productId);
  };

  if (!ready) return null;

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('oscrat.ui.category')}
        </label>
        <div className="w-full rounded-md px-1 py-2 text-gray-700">
          {selectedProduct 
            ? t(getProductCategoryKey(selectedProduct.productCategory))
            : '-'
          }
        </div>
      </div>
    </>
  );

  return (
    <ProductCreationForm
      formik={formik}
      isLoading={isLoading || formik.isSubmitting}
      additionalFields={additionalFields}
      submitDisabled={isLoading || formik.isSubmitting || !formik.isValid || !formik.dirty}
      headerTitle={t('oscrat.ui.validation.provide-initial-information')}
    />
  );
}

Existing.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
