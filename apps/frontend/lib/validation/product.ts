import * as Yup from 'yup';
import {
  productNameSchema,
  versionNameSchema,
  acronymSchema,
  productDescriptionSchema,
} from './inputs';
import {
  OscratProductType,
  OscratProductCategory,
  OscratProductVersionStatus,
} from '@oscrat/model';

// Product name with uniqueness validation
const createProductNameWithUniquenessSchema = (
  existingProducts: Array<{ name: string }> | undefined
) =>
  productNameSchema
    .required('oscrat.ui.validation.product-name-required')
    .test(
      'unique-name',
      'oscrat.ui.validation.product-name-already-exists',
      (value) => {
        if (!value || !existingProducts) return true;
        return !existingProducts.some(
          (product) => product.name.toLowerCase() === value.trim().toLowerCase()
        );
      }
    );

export const productCreateSchema = Yup.object({
  name: productNameSchema.required(
    'oscrat.ui.validation.product-name-required'
  ),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  description: productDescriptionSchema.optional(),
  type: Yup.mixed<OscratProductType>()
    .oneOf(
      Object.values(OscratProductType),
      'oscrat.ui.validation.product-type-invalid'
    )
    .required('oscrat.ui.validation.product-type-required'),
  productCategory: Yup.mixed<OscratProductCategory>()
    .oneOf(
      Object.values(OscratProductCategory),
      'oscrat.ui.validation.product-category-invalid'
    )
    .required('oscrat.ui.validation.product-category-required'),
  initialVersion: Yup.object({
    version: versionNameSchema.required(
      'oscrat.ui.validation.version-required'
    ),
    status: Yup.mixed<OscratProductVersionStatus>()
      .oneOf(
        Object.values(OscratProductVersionStatus),
        'oscrat.ui.validation.status-invalid'
      )
      .required('oscrat.ui.validation.status-required'),
  })
    .optional()
    .default(undefined),
});

export const productUpdateSchema = Yup.object({
  name: productNameSchema.required(
    'oscrat.ui.validation.product-name-required'
  ),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  description: productDescriptionSchema.optional(),
  type: Yup.mixed<OscratProductType>()
    .oneOf(
      Object.values(OscratProductType),
      'oscrat.ui.validation.product-type-invalid'
    )
    .optional(),
  productCategory: Yup.mixed<OscratProductCategory>()
    .oneOf(
      Object.values(OscratProductCategory),
      'oscrat.ui.validation.product-category-invalid'
    )
    .optional(),
});

export const existingProductSchema = Yup.object({
  sourceProductId: Yup.string().required(
    'oscrat.ui.validation.source-product-required'
  ),
  name: productNameSchema.required(
    'oscrat.ui.validation.product-name-required'
  ),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
});

// Schema factory that includes uniqueness validation
export const createExistingProductSchema = (
  existingProducts: Array<{ name: string }> | undefined
) =>
  Yup.object({
    sourceProductId: Yup.string().required(
      'oscrat.ui.validation.source-product-required'
    ),
    name: createProductNameWithUniquenessSchema(existingProducts),
    acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
    version: versionNameSchema.required(
      'oscrat.ui.validation.version-required'
    ),
    description: productDescriptionSchema.optional(),
  });

export const cacheProductSchema = Yup.object({
  name: productNameSchema.required(
    'oscrat.ui.validation.product-name-required'
  ),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
});

// Schema factory that includes uniqueness validation
export const createCacheProductSchema = (
  existingProducts: Array<{ name: string }> | undefined
) =>
  Yup.object({
    name: createProductNameWithUniquenessSchema(existingProducts),
    acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
    version: versionNameSchema.required(
      'oscrat.ui.validation.version-required'
    ),
    description: productDescriptionSchema.optional(),
  });

export type ProductCreateData = Yup.InferType<typeof productCreateSchema>;
export type ProductUpdateData = Yup.InferType<typeof productUpdateSchema>;
export type ExistingProductData = Yup.InferType<typeof existingProductSchema>;
export type CacheProductData = Yup.InferType<typeof cacheProductSchema>;
