import { OscratProductVulnerabilitySeverity } from '@oscrat/model';

/**
 * Maps scan report severity strings to OscratProductVulnerabilitySeverity enum
 */
export const mapScanSeverityToVulnerabilitySeverity = (
  scanSeverity: string
): OscratProductVulnerabilitySeverity => {
  const normalized = scanSeverity.toLowerCase();

  switch (normalized) {
    case 'critical':
      return OscratProductVulnerabilitySeverity.CRITICAL;
    case 'high':
      return OscratProductVulnerabilitySeverity.HIGH;
    case 'medium':
      return OscratProductVulnerabilitySeverity.MEDIUM;
    case 'low':
    case 'negligible':
      return OscratProductVulnerabilitySeverity.LOW;
    default:
      return OscratProductVulnerabilitySeverity.LOW;
  }
};
