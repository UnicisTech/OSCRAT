import { useGetCscIso } from '@/lib/api/hooks/csc';
import type { ISO } from '@/types';

/**
 * Hook to fetch and manage ISO data for a team
 * @param slug Team slug
 * @param initialIso Optional initial ISO value
 */
export function useISO(slug: string, initialIso?: ISO) {
  const { data: response, isLoading, isError, error } = useGetCscIso(slug);

  // Use initialIso if provided, otherwise use the fetched data
  const iso = initialIso ?? response;

  return {
    iso,
    isLoading,
    isError,
    error,
  };
}

export default useISO;
