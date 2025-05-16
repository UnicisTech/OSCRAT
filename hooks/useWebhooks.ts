import {
  useGetWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
} from '@/lib/api/hooks/webhooks';
import type { EndpointOut } from 'svix';

/**
 * Hook to fetch and manage team webhooks
 * @param slug Team slug
 */
export function useWebhooks(slug: string) {
  const {
    data: webhooks,
    isLoading: isFetching,
    isError,
    error,
  } = useGetWebhooks(slug);

  const createMutation = useCreateWebhook(slug);
  const updateMutation = useUpdateWebhook(slug);
  const deleteMutation = useDeleteWebhook(slug);

  const createWebhook = async (data: Partial<EndpointOut>) => {
    return createMutation.mutateAsync(data);
  };

  const updateWebhook = async (id: string, data: Partial<EndpointOut>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteWebhook = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    webhooks,
    isLoading,
    isError,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
  };
}
