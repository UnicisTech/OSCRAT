import { useQuery, useMutation } from '@tanstack/react-query';
import { teamInvitationsEndpoints } from '@/lib/api/endpoints/teams/invitations';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

export function useGetTeamInvitations(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.invitations(slug),
    queryFn: () => teamInvitationsEndpoints.getInvitations(slug),
  });
}

export function useCreateTeamInvitation(slug: string) {
  return useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      teamInvitationsEndpoints.createInvitation(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invitations(slug),
      });
    },
  });
}

export function useDeleteTeamInvitation(slug: string) {
  return useMutation({
    mutationFn: (id: string) =>
      teamInvitationsEndpoints.deleteInvitation(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invitations(slug),
      });
    },
  });
}

export function useGetInvitation(token: string) {
  return useQuery({
    queryKey: queryKeys.invitations.detail(token),
    queryFn: () => teamInvitationsEndpoints.getInvitation(token),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password?: string }) =>
      teamInvitationsEndpoints.acceptInvitation(token, { password }),
  });
}
