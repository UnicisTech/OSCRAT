import { useQuery } from '@tanstack/react-query';
import { auditLogEndpoints } from '@/lib/api/endpoints/auditLogs';
import { queryKeys } from '@/lib/api/queryKeys';
import type { OscratAuditLogQueryParams } from '@oscrat/model';

export function useSearchAuditLogs(
  teamSlug: string,
  params: OscratAuditLogQueryParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.teams.auditLogs(
      teamSlug,
      params as Record<string, unknown>
    ),
    queryFn: () => auditLogEndpoints.searchAuditLogs(teamSlug, params),
    enabled: options?.enabled !== false,
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}

export function useRecentActivities(
  teamSlug: string,
  options?: { enabled?: boolean }
) {
  return useSearchAuditLogs(
    teamSlug,
    { hasProductOrVersion: true, pageSize: 5 },
    options
  );
}

export function useAuditLogFilterOptions(
  teamSlug: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.teams.detail(teamSlug), 'audit-logs', 'filter-options'],
    queryFn: () => auditLogEndpoints.getFilterOptions(teamSlug),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export const useGetAuditLogs = useSearchAuditLogs;
