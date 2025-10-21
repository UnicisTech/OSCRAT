import * as Yup from 'yup';
import { 
  productNameSchema, 
  versionNameSchema, 
  acronymSchema, 
  productDescriptionSchema 
} from '@/lib/validation/inputs';
import { OscratProductType, OscratProductCategory } from '@oscrat/model';

/**
 * Product creation schema
 */
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

/**
 * Product creation schema (from existing product)
 */
export const existingProductSchema = Yup.object({
  sourceProductId: Yup.string().required('oscrat.ui.validation.source-product-required'),
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
});

/**
 * Product creation schema (from cache)
 */
export const cacheProductSchema = Yup.object({
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  acronym: acronymSchema.required('oscrat.ui.validation.acronym-required'),
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
});

// Type exports
export type ProductCreateData = Yup.InferType<typeof productCreateSchema>;
export type ExistingProductData = Yup.InferType<typeof existingProductSchema>;
export type CacheProductData = Yup.InferType<typeof cacheProductSchema>;
