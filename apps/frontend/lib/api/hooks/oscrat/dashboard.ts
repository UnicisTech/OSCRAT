import { useQuery } from '@tanstack/react-query';
import { oscratDashboardEndpoints } from '@/lib/api/endpoints/oscrat/dashboard';
import { queryKeys } from '@/lib/api/queryKeys';

export function useGetDashboardSummary(teamId: string) {
  return useQuery({
    queryKey: queryKeys.oscrat.dashboard.summary(teamId),
    queryFn: () => oscratDashboardEndpoints.getDashboardSummary(teamId),
  });
}
