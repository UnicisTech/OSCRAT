import { ComplianceArea } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { useGetComplianceData } from '@/lib/api/hooks/compliance';
import { useGetTeamComplianceData } from '@/lib/api/hooks/teamCompliance';
import { COMPLIANCE_TYPES, type ComplianceType } from '@/lib/compliance/translations';

interface UseComplianceDataParams {
  teamSlug: string;
  teamRole: OscratOrganizationRole;
  complianceType: ComplianceType;
  enabled?: boolean;
}

interface UseComplianceDataReturn {
  complianceData: ComplianceArea[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to load compliance data for either team or version assessments
 */
export function useComplianceData({
  teamSlug,
  teamRole,
  complianceType,
  enabled = true,
}: UseComplianceDataParams): UseComplianceDataReturn {
  const role = getRoleForTeam(teamRole);
  
  const isTeamCompliance = complianceType === COMPLIANCE_TYPES.TEAM;
  
  const teamComplianceQuery = useGetTeamComplianceData(
    teamSlug,
    { role },
    { enabled: enabled && isTeamCompliance && !!teamRole }
  );
  
  const versionComplianceQuery = useGetComplianceData(
    teamSlug,
    { role },
    { enabled: enabled && !isTeamCompliance && !!teamRole }
  );

  const activeQuery = isTeamCompliance ? teamComplianceQuery : versionComplianceQuery;

  return {
    complianceData: activeQuery.data || null,
    isLoading: activeQuery.isLoading,
    error: (activeQuery.error as Error) || null,
    refetch: activeQuery.refetch,
  };
}
