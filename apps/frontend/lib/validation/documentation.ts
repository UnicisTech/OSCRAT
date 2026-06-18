import * as Yup from 'yup';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import { titleSchema } from './inputs';

// Reusable enum validators
const statusValidator = Yup.mixed<DocumentationStatus>()
  .oneOf(
    Object.values(DocumentationStatus),
    'oscrat.ui.validation.documentation-status-invalid'
  )
  .optional();

const visibilityValidator = Yup.mixed<DocumentationVisibility>()
  .oneOf(
    Object.values(DocumentationVisibility),
    'oscrat.ui.validation.documentation-visibility-invalid'
  )
  .optional();

export const documentationCreateSchema = Yup.object({
  title: titleSchema.required('oscrat.ui.documentation.error.title-required'),
  content: Yup.string().optional(),
  visibility: visibilityValidator,
  status: statusValidator,
  productId: Yup.string().optional(),
  versionId: Yup.string().optional(),
});

export const documentationUpdateSchema = Yup.object({
  title: titleSchema.optional(),
  content: Yup.string().optional(),
  visibility: visibilityValidator,
  status: statusValidator,
});

export const documentationFilterSchema = Yup.object({
  status: statusValidator,
  visibility: visibilityValidator,
  productId: Yup.string().optional(),
  versionId: Yup.string().optional(),
}).noUnknown(false);

export type DocumentationCreateData = Yup.InferType<
  typeof documentationCreateSchema
>;
export type DocumentationUpdateData = Yup.InferType<
  typeof documentationUpdateSchema
>;
export type DocumentationFilterData = Yup.InferType<
  typeof documentationFilterSchema
>;
