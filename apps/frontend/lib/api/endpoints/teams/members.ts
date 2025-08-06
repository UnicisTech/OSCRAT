import { TeamMemberWithUser } from '@/types';
import { api } from '@/lib/api/client';
import { Role } from '@oscrat/model';

export type UpdateMemberRoleData = {
  memberId: string;
  role: Role;
};

export const memberEndpoints = {
  updateRole: (slug: string, data: UpdateMemberRoleData) =>
    api.patch<TeamMemberWithUser>(`/teams/${slug}/members`, data),

  removeMember: (slug: string, memberId: string) =>
    api.delete<void>(`/teams/${slug}/members`, {
      params: { memberId },
    }),

  leaveTeam: (slug: string) => api.put<void>(`/teams/${slug}/members`),
};
