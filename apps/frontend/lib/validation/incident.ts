import * as Yup from 'yup';
import { productDescriptionSchema } from '@/lib/validation/inputs';
import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
} from '@oscrat/model';

const INCIDENT_STATUSES = Object.values(IncidentStatus);
const INCIDENT_CLASSIFICATIONS = Object.values(IncidentClassification);
const INCIDENT_ATTACK_TYPES = Object.values(IncidentAttackType);
const INCIDENT_SEVERITIES = Object.values(IncidentSeverity);

/**
 * Incident creation schema
 */
export const incidentCreateSchema = Yup.object({
  status: Yup.string()
    .oneOf(INCIDENT_STATUSES, 'oscrat.ui.validation.incident-status-invalid')
    .required('oscrat.ui.validation.incident-status-required'),
  
  classification: Yup.string()
    .oneOf(INCIDENT_CLASSIFICATIONS, 'oscrat.ui.validation.incident-classification-invalid')
    .required('oscrat.ui.validation.incident-classification-required'),
  
  attackType: Yup.string()
    .oneOf(INCIDENT_ATTACK_TYPES, 'oscrat.ui.validation.incident-attack-type-invalid')
    .required('oscrat.ui.validation.incident-attack-type-required'),
  
  severity: Yup.string()
    .oneOf(INCIDENT_SEVERITIES, 'oscrat.ui.validation.incident-severity-invalid')
    .required('oscrat.ui.validation.incident-severity-required'),
  
  reporterId: Yup.string()
    .trim()
    .required('oscrat.ui.validation.incident-reporter-required'),
  
  dateOfDetection: Yup.date()
    .required('oscrat.ui.validation.incident-date-of-detection-required')
    .max(new Date(), 'oscrat.ui.validation.date-cannot-be-future'),
  
  description: productDescriptionSchema
    .required('oscrat.ui.validation.description-required'),
  
  scope: Yup.string()
    .trim()
    .required('oscrat.ui.validation.incident-scope-required')
    .min(1, 'oscrat.ui.validation.incident-scope-required')
    .max(500, 'oscrat.ui.validation.description-max-length'),
  
  // Optional fields
  assetDetails: Yup.string()
    .trim()
    .max(500, 'oscrat.ui.validation.description-max-length')
    .optional(),
  
  handlingDate: Yup.date()
    .optional()
    .nullable()
    .test('handling-after-detection', 'oscrat.ui.validation.incident-handling-date-invalid', function(value) {
      if (!value) return true;
      const { dateOfDetection } = this.parent;
      if (!dateOfDetection) return true;
      return value >= dateOfDetection;
    }),
  
  correctiveActions: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-actions-too-long')
    .optional(),
  
  rootCause: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-root-cause-too-long')
    .optional(),
  
  preventiveActions: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-actions-too-long')
    .optional(),
  
  suspectedUnlawfulAct: Yup.boolean()
    .optional()
    .default(false),
  
  unlawfulActDescription: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-unlawful-act-too-long')
    .optional()
    .when('suspectedUnlawfulAct', {
      is: true,
      then: (schema) => schema.required('oscrat.ui.validation.incident-unlawful-act-description-required'),
      otherwise: (schema) => schema.nullable()
    }),
  
  crossBorderImpact: Yup.boolean()
    .optional()
    .default(false),
  
  crossBorderImpactDetails: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-cross-border-details-too-long')
    .optional()
    .when('crossBorderImpact', {
      is: true,
      then: (schema) => schema.required('oscrat.ui.validation.incident-cross-border-details-required'),
      otherwise: (schema) => schema.nullable()
    }),
  
  attachmentIds: Yup.array()
    .of(Yup.string())
    .optional(),
});

/**
 * Incident update schema (all fields optional except those that have dependencies)
 */
export const incidentUpdateSchema = Yup.object({
  status: Yup.string()
    .oneOf(INCIDENT_STATUSES, 'oscrat.ui.validation.incident-status-invalid')
    .optional(),
  
  classification: Yup.string()
    .oneOf(INCIDENT_CLASSIFICATIONS, 'oscrat.ui.validation.incident-classification-invalid')
    .optional(),
  
  attackType: Yup.string()
    .oneOf(INCIDENT_ATTACK_TYPES, 'oscrat.ui.validation.incident-attack-type-invalid')
    .optional(),
  
  severity: Yup.string()
    .oneOf(INCIDENT_SEVERITIES, 'oscrat.ui.validation.incident-severity-invalid')
    .optional(),
  
  reporterId: Yup.string()
    .trim()
    .optional(),
  
  dateOfDetection: Yup.date()
    .optional()
    .max(new Date(), 'oscrat.ui.validation.date-cannot-be-future'),
  
  description: productDescriptionSchema
    .optional(),
  
  scope: Yup.string()
    .trim()
    .min(1, 'oscrat.ui.validation.incident-scope-required')
    .max(500, 'oscrat.ui.validation.description-max-length')
    .optional(),
  
  assetDetails: Yup.string()
    .trim()
    .max(500, 'oscrat.ui.validation.description-max-length')
    .optional(),
  
  handlingDate: Yup.date()
    .optional()
    .nullable()
    .test('handling-after-detection', 'oscrat.ui.validation.incident-handling-date-invalid', function(value) {
      if (!value) return true;
      const { dateOfDetection } = this.parent;
      if (!dateOfDetection) return true;
      return value >= dateOfDetection;
    }),
  
  correctiveActions: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-actions-too-long')
    .optional(),
  
  rootCause: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-root-cause-too-long')
    .optional(),
  
  preventiveActions: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-actions-too-long')
    .optional(),
  
  suspectedUnlawfulAct: Yup.boolean()
    .optional(),
  
  unlawfulActDescription: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-unlawful-act-too-long')
    .optional()
    .when('suspectedUnlawfulAct', {
      is: true,
      then: (schema) => schema.required('oscrat.ui.validation.incident-unlawful-act-description-required'),
      otherwise: (schema) => schema.nullable()
    }),
  
  crossBorderImpact: Yup.boolean()
    .optional(),
  
  crossBorderImpactDetails: Yup.string()
    .trim()
    .max(1000, 'oscrat.ui.validation.incident-cross-border-details-too-long')
    .optional()
    .when('crossBorderImpact', {
      is: true,
      then: (schema) => schema.required('oscrat.ui.validation.incident-cross-border-details-required'),
      otherwise: (schema) => schema.nullable()
    }),
  
  attachmentIds: Yup.array()
    .of(Yup.string())
    .optional(),
});

