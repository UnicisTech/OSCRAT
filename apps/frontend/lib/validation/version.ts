import * as Yup from 'yup';
import { versionNameSchema, productDescriptionSchema } from './inputs';
import { OscratProductVersionStatus } from '@oscrat/model';

export const versionCreateSchema = Yup.object({
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  description: productDescriptionSchema.optional(),
  status: Yup.string()
    .oneOf(Object.values(OscratProductVersionStatus), 'oscrat.ui.validation.status-invalid')
    .required('oscrat.ui.validation.status-required'),
  supportEndDate: Yup.date().nullable().optional(),
});

export const versionUpdateSchema = Yup.object({
  version: versionNameSchema.required('oscrat.ui.validation.version-required'),
  status: Yup.string()
    .oneOf(Object.values(OscratProductVersionStatus), 'oscrat.ui.validation.status-invalid')
    .required('oscrat.ui.validation.status-required'),
  releaseDate: Yup.date().nullable().optional(),
  supportEndDate: Yup.date().nullable().optional(),
});

export type VersionCreateData = Yup.InferType<typeof versionCreateSchema>;
export type VersionUpdateData = Yup.InferType<typeof versionUpdateSchema>;
