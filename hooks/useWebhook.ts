import { useGetWebhook } from '@/lib/api/hooks';

/**
 * Hook to fetch and manage a single webhook
 * @param slug Team slug
 * @param endpointId Webhook endpoint ID
 */
export function useWebhook(slug: string, endpointId: string | null) {
  const {
    data: webhook,
    isLoading,
    isError,
    error,
  } = useGetWebhook(slug, endpointId || '');

  return {
    webhook,
    isLoading,
    isError,
    error,
  };
}
