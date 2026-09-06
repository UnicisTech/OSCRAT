import type { TaskStatus } from '@prisma/client';
import type { ConfigurationSeverity } from './configurationScan';

export const TASK_CONFIGURATION_PROPERTY_KEYS = {
  REPORT_ID: 'configuration_report_id',
  RULE_ID: 'configuration_rule_id',
  CCE: 'configuration_cce',
  SEVERITY: 'configuration_severity',
} as const;

export const TASK_CSC_PROPERTY_KEYS = {
  CONTROLS: 'csc_controls',
  AUDIT_LOGS: 'csc_audit_logs',
} as const;

export const TASK_RISK_PROPERTY_KEYS = {
  DETAILS: 'riskDetails',
  TREATMENT: 'riskTreatment',
} as const;

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
type RiskCategory = 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY';
type RiskTreatmentOption = 'ACCEPT' | 'REDUCE' | 'AVOID' | 'TRANSFER';

interface RiskDetailsProperties {
  threat: string;
  category: RiskCategory[];
  likelihood: RiskLevel;
  impact: RiskLevel;
  exposure: RiskLevel;
  ownerId: string;
}

interface RiskTreatmentProperties {
  treatment: RiskTreatmentOption;
  measures?: string;
  residualExposure: RiskLevel;
  responsibleId: string;
}

interface TaskByRuleSummary {
  id: number;
  taskNumber: number;
  title: string;
  status: TaskStatus;
}

interface TaskConfigurationProperties {
  [TASK_CONFIGURATION_PROPERTY_KEYS.REPORT_ID]?: string;
  [TASK_CONFIGURATION_PROPERTY_KEYS.RULE_ID]?: string;
  [TASK_CONFIGURATION_PROPERTY_KEYS.CCE]?: string;
  [TASK_CONFIGURATION_PROPERTY_KEYS.SEVERITY]?: ConfigurationSeverity;
}

interface TaskCscAuditLogActor {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface TaskCscAuditLogEntry {
  actor: TaskCscAuditLogActor;
  date: number;
  event: string;
  diff: { prevValue: string | null; nextValue: string };
}

interface TaskCscProperties {
  [TASK_CSC_PROPERTY_KEYS.CONTROLS]?: string[];
  [TASK_CSC_PROPERTY_KEYS.AUDIT_LOGS]?: TaskCscAuditLogEntry[];
}

interface TaskRiskFlagProperties {
  [TASK_RISK_PROPERTY_KEYS.DETAILS]?: RiskDetailsProperties;
  [TASK_RISK_PROPERTY_KEYS.TREATMENT]?: RiskTreatmentProperties;
}

type TaskProperties = TaskConfigurationProperties &
  TaskCscProperties &
  TaskRiskFlagProperties;

export type {
  TaskByRuleSummary,
  TaskConfigurationProperties,
  TaskCscAuditLogActor,
  TaskCscAuditLogEntry,
  TaskCscProperties,
  RiskLevel,
  RiskCategory,
  RiskTreatmentOption,
  RiskDetailsProperties,
  RiskTreatmentProperties,
  TaskRiskFlagProperties,
  TaskProperties,
};
