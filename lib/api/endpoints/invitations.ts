import { api } from '@/lib/api/client';
import { Invitation } from '@prisma/client';

export const invitationsEndpoints = {
  getInvitation: (token: string) =>
    api.get<Invitation>(`/invitations/${token}`),

  acceptInvitation: (token: string, data: { password?: string }) =>
    api.post<void>(`/invitations/${token}`, data),
};
