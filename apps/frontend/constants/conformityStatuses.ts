import type { TFunction } from 'next-i18next';

export const CONFORMITY_STATUS = {
  FULLY_COMPLIANT: 'Fully compliant',
  PARTIALLY_COMPLIANT: 'Partially compliant',
  NOT_COMPLIANT: 'Not Compliant',
  NOT_APPLICABLE: 'Not Applicable',
  IN_EVALUATION: 'In Evaluation',
  NOT_EVALUATED: 'Not Evaluated',
} as const;

export const COMPLIANCE_STATUS = {
  FULLY_COMPLIANT: 'Fully compliant',
  PARTIALLY_COMPLIANT: 'Partially compliant',
  NOT_COMPLIANT: 'Not Compliant',
  NOT_APPLICABLE: 'Not Applicable',
} as const;

export type ConformityStatus =
  (typeof CONFORMITY_STATUS)[keyof typeof CONFORMITY_STATUS];

export type ComplianceStatus =
  (typeof COMPLIANCE_STATUS)[keyof typeof COMPLIANCE_STATUS];

// Translation key mappings for conformity assessment status
export const complianceAssessmentStatusTranslationMap = {
  [COMPLIANCE_STATUS.FULLY_COMPLIANT]:
    'oscrat.ui.compliance-status.fully-compliant',
  [COMPLIANCE_STATUS.PARTIALLY_COMPLIANT]:
    'oscrat.ui.compliance-status.partially-compliant',
  [COMPLIANCE_STATUS.NOT_COMPLIANT]:
    'oscrat.ui.compliance-status.not-compliant',
  [COMPLIANCE_STATUS.NOT_APPLICABLE]:
    'oscrat.ui.compliance-status.not-applicable',
} as const;

export const getComplianceAssessmentStatusTranslationKey = (
  status: keyof typeof complianceAssessmentStatusTranslationMap
) => complianceAssessmentStatusTranslationMap[status];

// Single source of truth for the order conformity statuses are displayed in
// (legend, breakdown chart, badges).
export const CONFORMITY_STATUS_ORDER = [
  CONFORMITY_STATUS.FULLY_COMPLIANT,
  CONFORMITY_STATUS.PARTIALLY_COMPLIANT,
  CONFORMITY_STATUS.NOT_COMPLIANT,
  CONFORMITY_STATUS.NOT_APPLICABLE,
  CONFORMITY_STATUS.IN_EVALUATION,
  CONFORMITY_STATUS.NOT_EVALUATED,
] as const;

// Conformity status values share the dashboard labels so the legend and the
// "Conformity Status" badges read identically (e.g. both show "Compliant").
export const conformityStatusTranslationMap = {
  [CONFORMITY_STATUS.FULLY_COMPLIANT]: 'oscrat.ui.dashboard.compliant',
  [CONFORMITY_STATUS.PARTIALLY_COMPLIANT]: 'oscrat.ui.dashboard.partially-compliant',
  [CONFORMITY_STATUS.NOT_COMPLIANT]: 'oscrat.ui.dashboard.not-compliant',
  [CONFORMITY_STATUS.NOT_APPLICABLE]: 'oscrat.ui.dashboard.not-applicable',
  [CONFORMITY_STATUS.IN_EVALUATION]: 'oscrat.ui.dashboard.in-evaluation',
  [CONFORMITY_STATUS.NOT_EVALUATED]: 'oscrat.ui.dashboard.not-evaluated',
} as const;

// Resolves a stored conformity status to its display label, preserving the
// "[N%]" suffix used by the in-evaluation state.
export const getConformityStatusLabel = (status: string, t: TFunction): string => {
  if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) {
    const suffix = status.slice(CONFORMITY_STATUS.IN_EVALUATION.length).trim();
    const base = t(conformityStatusTranslationMap[CONFORMITY_STATUS.IN_EVALUATION]);
    return suffix ? `${base} ${suffix}` : base;
  }

  const key = conformityStatusTranslationMap[status as ConformityStatus];
  return key ? t(key) : status;
};
