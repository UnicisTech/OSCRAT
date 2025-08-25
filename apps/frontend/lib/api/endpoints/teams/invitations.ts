import { api } from '@/lib/api/client';
import { Invitation, Team } from '@oscrat/model';

export type InvitationWithTeam = Invitation & { team: Team };

export const teamInvitationsEndpoints = {
  getInvitations: (slug: string) =>
    api.get<Invitation[]>(`/teams/${slug}/invitations`),

  createInvitation: (slug: string, data: { email: string; role: string }) =>
    api.post<Invitation>(`/teams/${slug}/invitations`, data),

  deleteInvitation: (slug: string, id: string) =>
    api.delete<void>(`/teams/${slug}/invitations`, {
      params: { id },
    }),

  getInvitation: (token: string) =>
    api.get<InvitationWithTeam>(`invitations/${token}`),

  acceptInvitation: (token: string, data: { password?: string }) =>
    api.post<void>(`invitations/${token}/accept`, data),
};
