import * as Yup from 'yup';
import { productNameSchema } from '@/lib/validation/inputs';
import { OscratProductType, OscratProductCategory } from '@oscrat/model';

/**
 * Product creation schema
 */
export const productCreateSchema = Yup.object({
  name: productNameSchema.required('oscrat.ui.validation.product-name-required'),
  type: Yup.string()
    .oneOf(Object.values(OscratProductType), 'oscrat.ui.validation.product-type-invalid')
    .required('oscrat.ui.validation.product-type-required'),
  productCategory: Yup.string()
    .oneOf(Object.values(OscratProductCategory), 'oscrat.ui.validation.product-category-invalid')
    .required('oscrat.ui.validation.product-category-required'),
});

// Type exports
export type ProductCreateData = Yup.InferType<typeof productCreateSchema>;
