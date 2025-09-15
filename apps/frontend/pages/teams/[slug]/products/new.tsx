'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useTeamContext } from '@/context/TeamContext';
import { useCreateProduct, useGetProducts } from '@/lib/api/hooks/oscrat/projects';
import { OscratProductType, OscratProductCategory } from '@oscrat/model';
import type { OscratProductCreate } from '@oscrat/model';
import { getProductTypeKey, getProductCategoryKey } from '@/utils/translation';
import { InputWithLabel, SelectWithLabel } from '@/components/shared';
import { productCreateSchema } from '@/lib/validation/product';
import toast from 'react-hot-toast';
import { withTeamLayout } from '@/lib/layout-helpers';
import type { ApiError } from '@/types';

export default function AddProduct() {
  const { t } = useTranslation('common');
  const { slug: teamId } = useTeamContext();
  const { data: session } = useSession();
  const router = useRouter();

  const createProductMutation = useCreateProduct(teamId);
  const { data: existingProducts } = useGetProducts(teamId);
  
  const createProduct = async (data: OscratProductCreate) => {
    return createProductMutation.mutateAsync(data);
  };
  const isLoading = createProductMutation.isPending;

  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      productCategory: '',
    },
    validationSchema: productCreateSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        // Check for duplicates before starting creation
        if (existingProducts?.some(
          (product) => product.name.toLowerCase() === values.name.trim().toLowerCase()
        )) {
          toast.error(t('oscrat.ui.validation.product-name-already-exists'));
          return;
        }

        if (!session?.user?.id) {
          toast.error('User information not available');
          return;
        }

        const productData: OscratProductCreate = {
          name: values.name.trim(),
          type: values.type as OscratProductType,
          productCategory: values.productCategory as OscratProductCategory,
          createdBy: session.user.id,
        };

        await createProduct(productData);

        // Show success toast
        toast.success('Product created successfully');
        // Navigate back to products list on success
        router.replace(`/teams/${teamId}/products`);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message);
      }
    },
  });


  const productTypes = Object.values(OscratProductType);
  const productCategories = Object.values(OscratProductCategory);

  return (
    <div className="mt-10 flex w-full justify-center">
      <div className="w-full rounded-lg border bg-white p-6 shadow-lg md:w-1/2 lg:w-1/3 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
        <h2 className="mb-4 text-xl font-medium dark:text-gray-100">
          {t('add-new-product')}
        </h2>


        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <InputWithLabel
              type="text"
              name="name"
              placeholder={t('title')}
              value={formik.values.name}
              label={`${t('title')} *`}
              error={
                formik.touched.name && formik.errors.name 
                  ? t(formik.errors.name) 
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading || formik.isSubmitting}
              maxLength={40}
              required
            />

            <SelectWithLabel
              name="type"
              value={formik.values.type}
              label={`${t('oscrat.ui.product-type')} *`}
              error={
                formik.touched.type && formik.errors.type 
                  ? t(formik.errors.type) 
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading || formik.isSubmitting}
              required
              placeholder={t('choose')}
              options={productTypes.map((productType) => ({
                value: productType,
                label: t(getProductTypeKey(productType)),
              }))}
            />

            <SelectWithLabel
              name="productCategory"
              value={formik.values.productCategory}
              label={`${t('oscrat.ui.category')} *`}
              error={
                formik.touched.productCategory && formik.errors.productCategory 
                  ? t(formik.errors.productCategory) 
                  : undefined
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading || formik.isSubmitting}
              required
              placeholder={t('choose')}
              options={productCategories.map((productCategory) => ({
                value: productCategory,
                label: t(getProductCategoryKey(productCategory)),
              }))}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/teams/${teamId}/products`)}
              className="flex-1 rounded bg-gray-500 p-2 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
              disabled={isLoading || formik.isSubmitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting || !formik.isValid || !formik.dirty}
              className="flex-1 rounded bg-blue-500 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-800 dark:disabled:bg-gray-600"
            >
              {isLoading || formik.isSubmitting ? t('loading') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddProduct.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
