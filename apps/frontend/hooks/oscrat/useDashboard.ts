import { useGetDashboardSummary } from '@/lib/api/hooks/oscrat/dashboard';

/**
 * Hook to fetch dashboard summary for a team
 * Returns aggregated counts and statistics calculated on the backend
 * @param teamId Team ID
 */
export function useDashboard(teamId: string) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useGetDashboardSummary(teamId);

  return {
    summary,
    isLoading,
    isError,
    error,
  };
}

