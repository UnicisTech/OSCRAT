'use client';

// React
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';

// Form handling
import { useFormik } from 'formik';

// Context & Hooks
import { useTeamContext } from '@/context/TeamContext';
import { useGetProducts } from '@/lib/api/hooks/oscrat/projects';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';

// API endpoints
import { oscratVersionEndpoints } from '@/lib/api/endpoints/oscrat/versions';

// Models & Types
import { OscratProductType, OscratProductCategory, OscratProductVersionStatus } from '@oscrat/model';
import type { OscratProductCreate, OscratProductVersionCreate } from '@oscrat/model';
import type { ApiError } from '@/types';

// Components
import { InputWithLabel, SelectWithLabel } from '@/components/shared';

// Utils & Validation
import { getProductCategoryKey } from '@/utils/translation';
import { existingProductSchema } from '@/lib/validation/product';

// External libraries
import toast from 'react-hot-toast';

// Layout
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
          type: selectedProduct.type as OscratProductType,
          productCategory: selectedProduct.productCategory as OscratProductCategory,
          createdBy: userId,
          // TODO: Add acronym when implemented in DB
          // acronym: values.acronym.trim(),
          description: values.description?.trim(),
        };

        const createdProduct = await createProject(productData);
        
        const versionData: OscratProductVersionCreate = {
          version: values.version.trim(),
          status: OscratProductVersionStatus.ACTIVE,
          productId: createdProduct.id,
          createdBy: userId,
        };

        // EXCEPTION: Using the API endpoint directly with the created product ID, 
        // as an exception, since the hook is not available without a product Id
        await oscratVersionEndpoints.createVersion(teamId, createdProduct.id, versionData);

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

  const handleBack = () => {
    router.back();
  };

  if (!ready) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-[24px] font-semibold text-gray-800">
            {t('oscrat.ui.validation.provide-initial-information')}
          </h1>
        </div>

        {/* Content Section */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-6">
            <div className="space-y-4">
              {/* Source Product Dropdown */}
              <SelectWithLabel
                name="sourceProductId"
                value={formik.values.sourceProductId}
                label={`${t('oscrat.ui.source-product')} *`}
                error={
                  formik.touched.sourceProductId && formik.errors.sourceProductId 
                    ? formik.errors.sourceProductId 
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
                disabled={isLoading || formik.isSubmitting}
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
                disabled={isLoading || formik.isSubmitting}
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
                disabled={isLoading || formik.isSubmitting}
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
                  disabled={isLoading || formik.isSubmitting}
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

          <div className="flex pl-6 items-center justify-start space-x-3 rounded-b-lg border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading || formik.isSubmitting}
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting || !formik.isValid || !formik.dirty}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading || formik.isSubmitting ? t('loading') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Existing.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
