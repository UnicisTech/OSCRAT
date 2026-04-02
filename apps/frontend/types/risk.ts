export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskCategory = 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY';
export type RiskTreatmentOption = 'ACCEPT' | 'REDUCE' | 'AVOID' | 'TRANSFER';

export const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];
export const RISK_CATEGORIES: RiskCategory[] = ['CONFIDENTIALITY', 'INTEGRITY', 'AVAILABILITY'];
export const RISK_TREATMENT_OPTIONS: RiskTreatmentOption[] = ['ACCEPT', 'REDUCE', 'AVOID', 'TRANSFER'];

export interface RiskDetailsProperties {
  threat: string;
  category: RiskCategory[];
  likelihood: RiskLevel;
  impact: RiskLevel;
  exposure: RiskLevel;
  ownerId: string;
}

export interface RiskTreatmentProperties {
  treatment: RiskTreatmentOption;
  measures?: string;
  residualExposure: RiskLevel;
  responsibleId: string;
}

export interface TaskRiskProperties {
  riskDetails?: RiskDetailsProperties;
  riskTreatment?: RiskTreatmentProperties;
}
