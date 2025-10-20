export const ERROR_CODES = {
  // Job lifecycle
  INVALID_JOB_PAYLOAD: 'JOB_001',

  // SBOM processing stages
  SBOM_GENERATION_FAILED: 'SBOM_001',
  SBOM_CONVERSION_FAILED: 'SBOM_002',
  SBOM_ANALYSIS_FAILED: 'SBOM_003',
  SBOM_IMPORT_FAILED: 'SBOM_004',

  // Vulnerability scanning stages
  VULNERABILITY_SCAN_FAILED: 'VULN_001',
  VULNERABILITY_ANALYSIS_FAILED: 'VULN_002',

  // Repository operations
  REPOSITORY_OPERATION_FAILED: 'REPO_001',

  // Generic failure fallback
  UNKNOWN_ERROR: 'UNKNOWN',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];