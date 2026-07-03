import * as Yup from 'yup';
import {
  productDescriptionSchema,
  incidentScopeSchema,
  incidentActionsSchema,
} from './inputs';
import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
} from '@oscrat/model';
import { TITLE_CHAR_REGEX } from '@/lib/text-sanitize';

const incidentNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.incident-name-required')
  .max(100, 'oscrat.ui.validation.title-too-long')
  .matches(TITLE_CHAR_REGEX, 'oscrat.ui.validation.invalid-characters');

const INCIDENT_STATUSES = Object.values(IncidentStatus);
const INCIDENT_CLASSIFICATIONS = Object.values(IncidentClassification);
const INCIDENT_ATTACK_TYPES = Object.values(IncidentAttackType);
const INCIDENT_SEVERITIES = Object.values(IncidentSeverity);

export const incidentCreateSchema = Yup.object({
  name: incidentNameSchema.required(
    'oscrat.ui.validation.incident-name-required'
  ),

  status: Yup.mixed<IncidentStatus>()
    .oneOf(INCIDENT_STATUSES, 'oscrat.ui.validation.incident-status-invalid')
    .required('oscrat.ui.validation.incident-status-required'),

  classification: Yup.mixed<IncidentClassification>()
    .oneOf(
      INCIDENT_CLASSIFICATIONS,
      'oscrat.ui.validation.incident-classification-invalid'
    )
    .required('oscrat.ui.validation.incident-classification-required'),

  attackType: Yup.mixed<IncidentAttackType>()
    .oneOf(
      INCIDENT_ATTACK_TYPES,
      'oscrat.ui.validation.incident-attack-type-invalid'
    )
    .required('oscrat.ui.validation.incident-attack-type-required'),

  severity: Yup.mixed<IncidentSeverity>()
    .oneOf(
      INCIDENT_SEVERITIES,
      'oscrat.ui.validation.incident-severity-invalid'
    )
    .required('oscrat.ui.validation.incident-severity-required'),

  reporterId: Yup.string()
    .trim()
    .required('oscrat.ui.validation.incident-reporter-required'),

  dateOfDetection: Yup.date()
    .required('oscrat.ui.validation.incident-date-of-detection-required')
    .max(new Date(), 'oscrat.ui.validation.date-cannot-be-future'),

  description: productDescriptionSchema.required(
    'oscrat.ui.validation.description-required'
  ),

  scope: incidentScopeSchema.required(
    'oscrat.ui.validation.incident-scope-required'
  ),

  assetDetails: productDescriptionSchema.optional(),

  handlingDate: Yup.date()
    .optional()
    .nullable()
    .test(
      'handling-after-detection',
      'oscrat.ui.validation.incident-handling-date-invalid',
      function (value) {
        if (!value) return true;
        const { dateOfDetection } = this.parent;
        if (!dateOfDetection) return true;
        return value >= dateOfDetection;
      }
    ),

  correctiveActions: incidentActionsSchema.optional(),
  rootCause: incidentActionsSchema.optional(),
  preventiveActions: incidentActionsSchema.optional(),

  suspectedUnlawfulAct: Yup.boolean().optional().default(false),

  unlawfulActDescription: incidentActionsSchema
    .optional()
    .when('suspectedUnlawfulAct', {
      is: true,
      then: (schema) =>
        schema.required(
          'oscrat.ui.validation.incident-unlawful-act-description-required'
        ),
      otherwise: (schema) => schema.nullable(),
    }),

  crossBorderImpact: Yup.boolean().optional().default(false),

  crossBorderImpactDetails: incidentActionsSchema
    .optional()
    .when('crossBorderImpact', {
      is: true,
      then: (schema) =>
        schema.required(
          'oscrat.ui.validation.incident-cross-border-details-required'
        ),
      otherwise: (schema) => schema.nullable(),
    }),

  attachmentIds: Yup.array().of(Yup.string().defined()).optional(),
});

export const incidentUpdateSchema = Yup.object({
  name: incidentNameSchema.optional(),

  status: Yup.mixed<IncidentStatus>()
    .oneOf(INCIDENT_STATUSES, 'oscrat.ui.validation.incident-status-invalid')
    .optional(),

  classification: Yup.mixed<IncidentClassification>()
    .oneOf(
      INCIDENT_CLASSIFICATIONS,
      'oscrat.ui.validation.incident-classification-invalid'
    )
    .optional(),

  attackType: Yup.mixed<IncidentAttackType>()
    .oneOf(
      INCIDENT_ATTACK_TYPES,
      'oscrat.ui.validation.incident-attack-type-invalid'
    )
    .optional(),

  severity: Yup.mixed<IncidentSeverity>()
    .oneOf(
      INCIDENT_SEVERITIES,
      'oscrat.ui.validation.incident-severity-invalid'
    )
    .optional(),

  reporterId: Yup.string().trim().optional(),

  dateOfDetection: Yup.date()
    .optional()
    .max(new Date(), 'oscrat.ui.validation.date-cannot-be-future'),

  description: productDescriptionSchema.optional(),
  scope: incidentScopeSchema.optional(),
  assetDetails: productDescriptionSchema.optional(),

  handlingDate: Yup.date()
    .optional()
    .nullable()
    .test(
      'handling-after-detection',
      'oscrat.ui.validation.incident-handling-date-invalid',
      function (value) {
        if (!value) return true;
        const { dateOfDetection } = this.parent;
        if (!dateOfDetection) return true;
        return value >= dateOfDetection;
      }
    ),

  correctiveActions: incidentActionsSchema.optional(),
  rootCause: incidentActionsSchema.optional(),
  preventiveActions: incidentActionsSchema.optional(),

  suspectedUnlawfulAct: Yup.boolean().optional(),

  unlawfulActDescription: incidentActionsSchema
    .optional()
    .when('suspectedUnlawfulAct', {
      is: true,
      then: (schema) =>
        schema.required(
          'oscrat.ui.validation.incident-unlawful-act-description-required'
        ),
      otherwise: (schema) => schema.nullable(),
    }),

  crossBorderImpact: Yup.boolean().optional(),

  crossBorderImpactDetails: incidentActionsSchema
    .optional()
    .when('crossBorderImpact', {
      is: true,
      then: (schema) =>
        schema.required(
          'oscrat.ui.validation.incident-cross-border-details-required'
        ),
      otherwise: (schema) => schema.nullable(),
    }),

  attachmentIds: Yup.array().of(Yup.string().defined()).optional(),
});
