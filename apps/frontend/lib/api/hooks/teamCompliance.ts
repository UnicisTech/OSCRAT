import { useQuery } from '@tanstack/react-query';
import { teamComplianceEndpoints } from '@/lib/api/endpoints/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { queryKeys } from '@/lib/api/queryKeys';

export function useGetTeamComplianceData(
  teamSlug: string,
  params: { role: OscratOrganizationRole },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.teamCompliance.data(teamSlug, { role: params.role }),
    queryFn: () => teamComplianceEndpoints.getData(teamSlug, params),
    enabled: options?.enabled !== false && !!params.role,
  });
}
