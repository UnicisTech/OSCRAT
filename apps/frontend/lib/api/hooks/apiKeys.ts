import { useQuery, useMutation } from '@tanstack/react-query';
import { apiKeysEndpoints } from '@/lib/api/endpoints/apiKeys';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

// Get API keys for a team
export function useGetApiKeys(teamSlug: string) {
  return useQuery({
    queryKey: queryKeys.teams.apiKeys(teamSlug),
    queryFn: () => apiKeysEndpoints.list(teamSlug),
  });
}

// Create a new API key
export function useCreateApiKey(teamSlug: string) {
  return useMutation({
    mutationFn: (name: string) => apiKeysEndpoints.create(teamSlug, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.apiKeys(teamSlug),
      });
    },
  });
}

// Delete an API key
export function useDeleteApiKey(teamSlug: string) {
  return useMutation({
    mutationFn: (apiKeyId: string) =>
      apiKeysEndpoints.delete(teamSlug, apiKeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.apiKeys(teamSlug),
      });
    },
  });
}
