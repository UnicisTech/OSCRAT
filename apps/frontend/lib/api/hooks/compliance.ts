import { useQuery } from '@tanstack/react-query';
import { complianceEndpoints } from '@/lib/api/endpoints/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { queryKeys } from '@/lib/api/queryKeys';

export function useGetComplianceData(
  teamSlug: string,
  params: { role: OscratOrganizationRole },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.compliance.data(teamSlug, { role: params.role }),
    queryFn: () => complianceEndpoints.getData(teamSlug, params),
    enabled: options?.enabled !== false && !!params.role,
  });
}

