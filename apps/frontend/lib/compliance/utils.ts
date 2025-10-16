import { OscratOrganizationRole } from '@oscrat/model';

/**
 * Get the primary organization role from a team's roles array
 */
export function getRoleForTeam(role: OscratOrganizationRole): OscratOrganizationRole {
  if (role.includes(OscratOrganizationRole.MANUFACTURER)) return OscratOrganizationRole.MANUFACTURER;
  if (role.includes(OscratOrganizationRole.IMPORTER)) return OscratOrganizationRole.IMPORTER;
  if (role.includes(OscratOrganizationRole.DISTRIBUTOR)) return OscratOrganizationRole.DISTRIBUTOR;
  if (role.includes(OscratOrganizationRole.DATA_STEWARD)) return OscratOrganizationRole.DATA_STEWARD;
  return OscratOrganizationRole.MANUFACTURER;
}

/**
 * Create storage key for compliance state
 */
export function getComplianceStorageKey(entityId: string, isTeam: boolean = false): string {
  return isTeam ? `team_compliance_${entityId}` : `compliance_${entityId}`;
}
