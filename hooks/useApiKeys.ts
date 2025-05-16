import {
  useGetApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
} from '@/lib/api/hooks/apiKeys';

/**
 * Hook to manage API keys for a team
 * @param teamSlug Team slug to use for data fetching and operations
 */
export function useApiKeys(teamSlug: string) {
  const {
    data,
    isLoading: isFetching,
    isError,
    error,
  } = useGetApiKeys(teamSlug);

  // Mutations
  const createMutation = useCreateApiKey(teamSlug);
  const deleteMutation = useDeleteApiKey(teamSlug);

  // Create a new API key
  const createApiKey = async (name: string) => {
    return createMutation.mutateAsync(name);
  };

  // Delete an API key
  const deleteApiKey = async (apiKeyId: string) => {
    return deleteMutation.mutateAsync(apiKeyId);
  };

  const isLoading =
    isFetching || createMutation.isPending || deleteMutation.isPending;

  return {
    apiKeys: data || [],
    isLoading,
    isError,
    error,
    createApiKey,
    deleteApiKey,
  };
}
