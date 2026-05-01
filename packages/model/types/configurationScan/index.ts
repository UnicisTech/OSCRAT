import type { TaskByRuleSummary } from '../task';

/** Severity levels from XCCDF rule definitions */
export const CONFIGURATION_SEVERITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNKNOWN: 'unknown',
} as const;

export type ConfigurationSeverity =
  (typeof CONFIGURATION_SEVERITY)[keyof typeof CONFIGURATION_SEVERITY];

/** XCCDF rule result values (from OpenSCAP TestResult) */
export const CONFIGURATION_RESULT = {
  PASS: 'pass',
  FAIL: 'fail',
  ERROR: 'error',
  NOT_APPLICABLE: 'notapplicable',
  NOT_CHECKED: 'notchecked',
  NOT_SELECTED: 'notselected',
  INFORMATIONAL: 'informational',
  FIXED: 'fixed',
} as const;

export type ConfigurationResult =
  (typeof CONFIGURATION_RESULT)[keyof typeof CONFIGURATION_RESULT];

interface ConfigurationScanRuleResult {
  ruleId: string;
  title: string;
  cceId?: string;
  severity: ConfigurationSeverity;
  result: ConfigurationResult;
  description?: string;
  references?: string[];
  existingTask?: TaskByRuleSummary;
}

interface ConfigurationScanSummary {
  totalRules: number;
  passCount: number;
  failCount: number;
  errorCount: number;
  notApplicableCount: number;
  notCheckedCount: number;
  otherCount: number;

  profileId?: string;
  profileTitle?: string;
  benchmarkId?: string;
  benchmarkVersion?: string;
  targetHostname?: string;

  scanDate: string;
  oscapReportVersion?: string;

  rules: ConfigurationScanRuleResult[];
}

export type { ConfigurationScanSummary, ConfigurationScanRuleResult };

export const CONFIGURATION_RESULT_PRIORITY: Record<ConfigurationResult, number> = {
  [CONFIGURATION_RESULT.FAIL]: 0,
  [CONFIGURATION_RESULT.ERROR]: 1,
  [CONFIGURATION_RESULT.PASS]: 2,
  [CONFIGURATION_RESULT.FIXED]: 3,
  [CONFIGURATION_RESULT.INFORMATIONAL]: 4,
  [CONFIGURATION_RESULT.NOT_APPLICABLE]: 5,
  [CONFIGURATION_RESULT.NOT_CHECKED]: 6,
  [CONFIGURATION_RESULT.NOT_SELECTED]: 7,
};

export const CONFIGURATION_SEVERITY_RANK: Record<ConfigurationSeverity, number> = {
  [CONFIGURATION_SEVERITY.HIGH]: 0,
  [CONFIGURATION_SEVERITY.MEDIUM]: 1,
  [CONFIGURATION_SEVERITY.LOW]: 2,
  [CONFIGURATION_SEVERITY.UNKNOWN]: 3,
};

export function sortConfigurationScanRules(
  rules: ConfigurationScanRuleResult[]
): ConfigurationScanRuleResult[] {
  return [...rules].sort((a, b) => {
    const resultDiff =
      (CONFIGURATION_RESULT_PRIORITY[a.result] ?? 99) -
      (CONFIGURATION_RESULT_PRIORITY[b.result] ?? 99);
    if (resultDiff !== 0) return resultDiff;
    const severityDiff =
      (CONFIGURATION_SEVERITY_RANK[a.severity] ?? 99) -
      (CONFIGURATION_SEVERITY_RANK[b.severity] ?? 99);
    if (severityDiff !== 0) return severityDiff;
    return a.ruleId.localeCompare(b.ruleId);
  });
}
