import { useGetTeamPermissions } from '@/lib/api/hooks';

/**
 * Hook to fetch and manage team permissions
 * @param teamSlug Team slug
 */
export function usePermissions(teamSlug: string) {
  const { data, isLoading, isError, error } = useGetTeamPermissions(teamSlug);

  return {
    permissions: data,
    isLoading,
    isError,
    error,
  };
}
