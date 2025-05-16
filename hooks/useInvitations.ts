import {
  useGetTeamInvitations,
  useCreateTeamInvitation,
  useDeleteTeamInvitation,
} from '@/lib/api/hooks/invitations';

/**
 * Hook to fetch and manage team invitations
 * @param slug Team slug
 */
export function useInvitations(slug: string) {
  const {
    data: invitations,
    isLoading: isFetching,
    isError,
    error,
  } = useGetTeamInvitations(slug);

  const createMutation = useCreateTeamInvitation(slug);
  const deleteMutation = useDeleteTeamInvitation(slug);

  const createInvitation = async (email: string, role: string) => {
    return createMutation.mutateAsync({ email, role });
  };

  const deleteInvitation = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching || createMutation.isPending || deleteMutation.isPending;

  return {
    invitations,
    isLoading,
    isError,
    error,
    createInvitation,
    deleteInvitation,
  };
}
