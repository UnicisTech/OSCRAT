import type {
  RiskCategory,
  RiskDetailsProperties,
  RiskLevel,
  RiskTreatmentOption,
  RiskTreatmentProperties,
} from '@oscrat/model';

export type {
  RiskCategory,
  RiskDetailsProperties,
  RiskLevel,
  RiskTreatmentOption,
  RiskTreatmentProperties,
};

export const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
export const RISK_CATEGORIES: RiskCategory[] = [
  'CONFIDENTIALITY',
  'INTEGRITY',
  'AVAILABILITY',
];
export const RISK_TREATMENT_OPTIONS: RiskTreatmentOption[] = [
  'ACCEPT',
  'REDUCE',
  'AVOID',
  'TRANSFER',
];

export interface TaskRiskProperties {
  riskDetails?: RiskDetailsProperties;
  riskTreatment?: RiskTreatmentProperties;
}
