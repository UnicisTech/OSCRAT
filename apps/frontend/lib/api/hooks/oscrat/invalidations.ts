import { queryClient } from '@/lib/api/hooks';
import { queryKeys } from '@/lib/api/queryKeys';

/**
 * Invalidate every cache that displays product-level open counts
 * (Incidents / Vulnerabilities / Tasks summaries) so the Product list,
 * Product detail header, and per-version cards refresh after a child
 * mutation. Call from every incident, vulnerability, and task mutation's
 * `onSuccess`.
 */
export function invalidateProductCountCaches(
  teamSlug: string,
  productId?: string | null
) {
  if (productId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.detail(teamSlug, productId),
    });
  }
  queryClient.invalidateQueries({
    queryKey: [...queryKeys.teams.detail(teamSlug), 'products'],
  });
}
