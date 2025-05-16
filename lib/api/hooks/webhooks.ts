import { useQuery, useMutation } from '@tanstack/react-query';
import { webhooksEndpoints } from '@/lib/api/endpoints/teams/webhooks';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { EndpointOut } from 'svix';

export function useGetWebhooks(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.webhooks(slug),
    queryFn: () => webhooksEndpoints.getWebhooks(slug),
    enabled: !!slug,
  });
}

export function useGetWebhook(slug: string, endpointId: string) {
  return useQuery({
    queryKey: [...queryKeys.teams.webhooks(slug), endpointId],
    queryFn: () => webhooksEndpoints.getWebhook(slug, endpointId),
  });
}

export function useCreateWebhook(slug: string) {
  return useMutation({
    mutationFn: (data: Partial<EndpointOut>) =>
      webhooksEndpoints.createWebhook(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.webhooks(slug),
      });
    },
  });
}

export function useUpdateWebhook(slug: string) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EndpointOut> }) =>
      webhooksEndpoints.updateWebhook(slug, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.webhooks(slug),
      });
    },
  });
}

export function useDeleteWebhook(slug: string) {
  return useMutation({
    mutationFn: (id: string) => webhooksEndpoints.deleteWebhook(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.webhooks(slug),
      });
    },
  });
}
