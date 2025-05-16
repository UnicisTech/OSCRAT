import {
  useGetTeamMembers,
  useAddTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from '@/lib/api/hooks/teams';

/**
 * Hook to fetch and manage team members
 * @param slug Team slug
 */
export function useTeamMembers(slug: string) {
  const {
    data: members,
    isLoading: isFetching,
    isError,
    error,
  } = useGetTeamMembers(slug);

  const addMutation = useAddTeamMember(slug);
  const updateMutation = useUpdateTeamMember(slug);
  const deleteMutation = useDeleteTeamMember(slug);

  const addMember = async (userId: string, role: string) => {
    return addMutation.mutateAsync({ userId, role });
  };

  const updateMember = async (userId: string, role: string) => {
    return updateMutation.mutateAsync({ userId, role });
  };

  const deleteMember = async (userId: string) => {
    return deleteMutation.mutateAsync(userId);
  };

  const isLoading =
    isFetching ||
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    members,
    isLoading,
    isError,
    error,
    addMember,
    updateMember,
    deleteMember,
  };
}
