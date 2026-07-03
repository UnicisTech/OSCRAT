import * as Yup from 'yup';
import { OscratAssessmentType } from '@oscrat/model';

export const assessmentCreateSchema = Yup.object({
  type: Yup.mixed<OscratAssessmentType>()
    .oneOf(
      Object.values(OscratAssessmentType),
      'oscrat.ui.validation.assessment-type-invalid'
    )
    .required('oscrat.ui.validation.assessment-type-required'),
  schemaVersion: Yup.string().required(
    'oscrat.ui.validation.schema-version-required'
  ),
  // Freeform questionnaire answers. Must stay `Yup.mixed`, not `Yup.object`:
  // under `stripUnknown` a shapeless object schema would drop every key.
  rawData: Yup.mixed<Record<string, unknown>>().required(
    'oscrat.ui.validation.raw-data-required'
  ),
  productId: Yup.string().optional(),
  versionId: Yup.string().optional(),
});

// Narrower than create by design: `type`, `productId` and `versionId` are
// fixed at creation, so an update can only touch these two fields.
export const assessmentUpdateSchema = Yup.object({
  schemaVersion: Yup.string().optional(),
  rawData: Yup.mixed<Record<string, unknown>>().optional(),
});

export type AssessmentCreateData = Yup.InferType<typeof assessmentCreateSchema>;
export type AssessmentUpdateData = Yup.InferType<typeof assessmentUpdateSchema>;
