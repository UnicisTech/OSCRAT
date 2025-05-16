import { useGetIdpProviders } from '@/lib/api/hooks/idp';

/**
 * Hook to fetch IDP providers data
 */
export function useIdp() {
  const { data: providers, isLoading, isError, error } = useGetIdpProviders();

  return {
    providers,
    isLoading,
    isError,
    error,
  };
}
