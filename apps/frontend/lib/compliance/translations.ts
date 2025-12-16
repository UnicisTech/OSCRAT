import { OscratOrganizationRole } from '@oscrat/model';

export const COMPLIANCE_TYPES = {
  TEAM: 'team',
  VERSION: 'version',
} as const;

export type ComplianceType = typeof COMPLIANCE_TYPES[keyof typeof COMPLIANCE_TYPES];

export const COMPLIANCE_NAMESPACES = {
  TEAM_MANUFACTURER: 'compliance-team-manufacturer-4a',
  VERSION_MANUFACTURER: 'compliance-version-manufacturer-4b',
  TEAM_DISTRIBUTOR: 'compliance-team-distributor-5a',
  VERSION_DISTRIBUTOR: 'compliance-version-distributor-5b',
  TEAM_IMPORTER: 'compliance-team-importer-3a',
  VERSION_IMPORTER: 'compliance-version-importer-3b',
  TEAM_DATA_STEWARD: 'compliance-team-sme-manufacturer-7a',
  VERSION_DATA_STEWARD: 'compliance-version-sme-manufacturer-7b',
} as const;

export type ComplianceNamespace = typeof COMPLIANCE_NAMESPACES[keyof typeof COMPLIANCE_NAMESPACES];

/**
 * Maps organization role to compliance assessment namespace
 */
export function getComplianceNamespace(role: OscratOrganizationRole, type: ComplianceType): ComplianceNamespace {
  const roleFileMap: Record<OscratOrganizationRole, ComplianceNamespace> = {
    [OscratOrganizationRole.MANUFACTURER]: type === 'team' 
      ? COMPLIANCE_NAMESPACES.TEAM_MANUFACTURER 
      : COMPLIANCE_NAMESPACES.VERSION_MANUFACTURER,
    [OscratOrganizationRole.DISTRIBUTOR]: type === 'team' 
      ? COMPLIANCE_NAMESPACES.TEAM_DISTRIBUTOR 
      : COMPLIANCE_NAMESPACES.VERSION_DISTRIBUTOR,
    [OscratOrganizationRole.IMPORTER]: type === 'team' 
      ? COMPLIANCE_NAMESPACES.TEAM_IMPORTER 
      : COMPLIANCE_NAMESPACES.VERSION_IMPORTER,
    [OscratOrganizationRole.DATA_STEWARD]: type === 'team' 
      ? COMPLIANCE_NAMESPACES.TEAM_DATA_STEWARD 
      : COMPLIANCE_NAMESPACES.VERSION_DATA_STEWARD,
  };
  
  return roleFileMap[role];
}

/**
 * Get all compliance namespaces for preloading
 */
export function getAllComplianceNamespaces(): ComplianceNamespace[] {
  return Object.values(COMPLIANCE_NAMESPACES);
}

/**
 * Creates a translation function with custom translation fallback
 */
export function createComplianceTranslator(
  t: (key: string, options?: { ns: string }) => string,
  complianceNamespace: string,
  customTranslations: Record<string, string> | null
): (key: string) => string {
  return (key: string) => {
    if (customTranslations?.[key]) {
      return customTranslations[key];
    }
    return t(key, { ns: complianceNamespace });
  };
}

