import { useCreateJoin } from '@/lib/api/hooks/auth';
import type { JoinData } from '@/lib/api/endpoints/auth';

/**
 * Hook to manage user join/signup functionality
 */
export function useJoin() {
  const createJoinMutation = useCreateJoin();

  const join = async (data: JoinData) => {
    return createJoinMutation.mutateAsync(data);
  };

  return {
    join,
    isLoading: createJoinMutation.isPending,
    isError: createJoinMutation.isError,
    error: createJoinMutation.error,
  };
}
