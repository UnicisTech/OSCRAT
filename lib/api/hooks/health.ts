import { useQuery } from '@tanstack/react-query';
import { healthEndpoints } from '@/lib/api/endpoints/health';
import { queryKeys } from '@/lib/api/queryKeys';

export function useGetHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthEndpoints.check(),
  });
}
