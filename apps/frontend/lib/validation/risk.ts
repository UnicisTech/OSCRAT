import * as Yup from 'yup';
import {
  RISK_LEVELS,
  RISK_CATEGORIES,
  RISK_TREATMENT_OPTIONS,
  type RiskLevel,
  type RiskCategory,
  type RiskTreatmentOption,
} from '@/types/risk';

export const riskDetailsSchema = Yup.object({
  threat: Yup.string()
    .trim()
    .min(1, 'oscrat.ui.risk.validation.threat-required')
    .max(2000, 'oscrat.ui.risk.validation.threat-too-long')
    .required('oscrat.ui.risk.validation.threat-required'),

  category: Yup.array()
    .of(
      Yup.mixed<RiskCategory>()
        .oneOf([...RISK_CATEGORIES])
        .required()
    )
    .min(1, 'oscrat.ui.risk.validation.category-required')
    .required('oscrat.ui.risk.validation.category-required'),

  likelihood: Yup.mixed<RiskLevel>()
    .oneOf([...RISK_LEVELS], 'oscrat.ui.risk.validation.likelihood-required')
    .required('oscrat.ui.risk.validation.likelihood-required'),

  impact: Yup.mixed<RiskLevel>()
    .oneOf([...RISK_LEVELS], 'oscrat.ui.risk.validation.impact-required')
    .required('oscrat.ui.risk.validation.impact-required'),

  ownerId: Yup.string()
    .min(1, 'oscrat.ui.risk.validation.owner-required')
    .required('oscrat.ui.risk.validation.owner-required'),
});

export const riskTreatmentSchema = Yup.object({
  treatment: Yup.mixed<RiskTreatmentOption>()
    .oneOf(
      [...RISK_TREATMENT_OPTIONS],
      'oscrat.ui.risk.validation.treatment-required'
    )
    .required('oscrat.ui.risk.validation.treatment-required'),

  measures: Yup.string()
    .trim()
    .max(2000, 'oscrat.ui.risk.validation.measures-too-long')
    .optional(),

  residualExposure: Yup.mixed<RiskLevel>()
    .oneOf(
      [...RISK_LEVELS],
      'oscrat.ui.risk.validation.residual-exposure-required'
    )
    .required('oscrat.ui.risk.validation.residual-exposure-required'),

  responsibleId: Yup.string()
    .min(1, 'oscrat.ui.risk.validation.responsible-required')
    .required('oscrat.ui.risk.validation.responsible-required'),
});

export type RiskDetailsFormValues = Yup.InferType<typeof riskDetailsSchema>;
export type RiskTreatmentFormValues = Yup.InferType<typeof riskTreatmentSchema>;
