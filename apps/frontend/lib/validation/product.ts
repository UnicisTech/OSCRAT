import * as Yup from 'yup';
import { 
  productNameSchema, 
  versionNameSchema, 
  acronymSchema, 
  productDescriptionSchema 
} from './inputs';
import { OscratProductType, OscratProductCategory } from '@oscrat/model';

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
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  type: Yup.string()
    .oneOf(Object.values(OscratProductType), 'oscrat.ui.validation.product-type-invalid')
    .required('oscrat.ui.validation.product-type-required'),
  productCategory: Yup.string()
    .oneOf(Object.values(OscratProductCategory), 'oscrat.ui.validation.product-category-invalid')
    .required('oscrat.ui.validation.product-category-required'),
});

export const productUpdateSchema = Yup.object({
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  description: productDescriptionSchema.optional(),
  type: Yup.string()
    .oneOf(Object.values(OscratProductType), 'oscrat.ui.validation.product-type-invalid')
    .optional(),
});

export const existingProductSchema = Yup.object({
  sourceProductId: Yup.string().required('oscrat.ui.validation.source-product-required'),
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
});

// Schema factory that includes uniqueness validation
export const createExistingProductSchema = (
  existingProducts: Array<{ name: string }> | undefined
) =>
  Yup.object({
    sourceProductId: Yup.string().required('oscrat.ui.validation.source-product-required'),
    name: createProductNameWithUniquenessSchema(existingProducts),
    acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
    version: versionNameSchema.required('oscrat.ui.validation.version-required'),
    description: productDescriptionSchema.optional(),
  });

export const cacheProductSchema = Yup.object({
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
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
    version: versionNameSchema.required('oscrat.ui.validation.version-required'),
    description: productDescriptionSchema.optional(),
  });

export type ProductCreateData = Yup.InferType<typeof productCreateSchema>;
export type ProductUpdateData = Yup.InferType<typeof productUpdateSchema>;
export type ExistingProductData = Yup.InferType<typeof existingProductSchema>;
export type CacheProductData = Yup.InferType<typeof cacheProductSchema>;
