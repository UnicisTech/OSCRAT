import * as Yup from 'yup';
import { versionNameSchema } from '@/lib/validation/inputs';
import { OscratProductVersionStatus } from '@oscrat/model';

/**
 * Version creation schema
 */
export const versionCreateSchema = Yup.object({
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: Yup.string()
    .trim()
    .max(500, 'oscrat.ui.validation.description-too-long')
    .optional(),
  status: Yup.string()
    .oneOf(Object.values(OscratProductVersionStatus), 'oscrat.ui.validation.status-invalid')
    .required('oscrat.ui.validation.status-required'),
  supportEndDate: Yup.date()
    .nullable()
    .optional(),
});

/**
 * Version update schema
 */
export const versionUpdateSchema = Yup.object({
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  status: Yup.string()
    .oneOf(Object.values(OscratProductVersionStatus), 'oscrat.ui.validation.status-invalid')
    .required('oscrat.ui.validation.status-required'),
  supportEndDate: Yup.date()
    .nullable()
    .optional(),
});

// Type exports
export type VersionCreateData = Yup.InferType<typeof versionCreateSchema>;
export type VersionUpdateData = Yup.InferType<typeof versionUpdateSchema>;

