import { OscratOrganizationRole } from '@oscrat/model';

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
export function getComplianceNamespace(role: OscratOrganizationRole, type: 'team' | 'version'): ComplianceNamespace {
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

