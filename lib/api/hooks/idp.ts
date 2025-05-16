import { useQuery } from '@tanstack/react-query';
import { idpEndpoints } from '@/lib/api/endpoints/idp';
import { queryKeys } from '@/lib/api/queryKeys';

export function useGetIdpProviders() {
  return useQuery({
    queryKey: queryKeys.idp,
    queryFn: () => idpEndpoints.getMetadata(),
  });
}
