import { useGetInvitation } from '@/lib/api/hooks/invitations';
import { useRouter } from 'next/router';

/**
 * Hook to fetch and manage a single invitation
 * @param token Optional invitation token. If not provided, will be taken from router query
 */
export function useInvitation(token?: string) {
  const { query, isReady } = useRouter();
  const inviteToken = token || (isReady ? (query.token as string) : undefined);

  const {
    data: invitation,
    isLoading,
    isError,
    error,
  } = useGetInvitation(inviteToken ?? '');

  return {
    invitation,
    isLoading,
    isError,
    error,
  };
}
