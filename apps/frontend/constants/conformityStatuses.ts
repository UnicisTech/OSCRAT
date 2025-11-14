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

export type ConformityStatus = typeof CONFORMITY_STATUS[keyof typeof CONFORMITY_STATUS];

export type ComplianceStatus = typeof COMPLIANCE_STATUS[keyof typeof COMPLIANCE_STATUS];

// Translation key mappings for conformity assessment status
export const complianceAssessmentStatusTranslationMap = {
  [COMPLIANCE_STATUS.FULLY_COMPLIANT]: 'oscrat.ui.compliance-status.fully-compliant',
  [COMPLIANCE_STATUS.PARTIALLY_COMPLIANT]: 'oscrat.ui.compliance-status.partially-compliant',
  [COMPLIANCE_STATUS.NOT_COMPLIANT]: 'oscrat.ui.compliance-status.not-compliant',
  [COMPLIANCE_STATUS.NOT_APPLICABLE]: 'oscrat.ui.compliance-status.not-applicable',
} as const;

export const getComplianceAssessmentStatusTranslationKey = (
  status: keyof typeof complianceAssessmentStatusTranslationMap
) => complianceAssessmentStatusTranslationMap[status];
