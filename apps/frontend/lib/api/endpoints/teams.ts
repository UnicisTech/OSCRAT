import {
  TeamWithMemberCount,
  TeamMemberWithUser,
  TeamProperties,
} from '@/types';
import { api } from '@/lib/api/client';
import { Team } from '@oscrat/model';
import { Permission } from '@/lib/permissions';

export type UpdateTeamData = {
  name?: string;
  slug?: string;
  domain?: string;
};

export const teamsEndpoints = {
  list: () => api.get<TeamWithMemberCount[]>('/teams'),

  create: (name: string, slug: string) =>
    api.post<Team>('/teams', { name, slug }),

  getTeam: (slug: string) => api.get<TeamWithMemberCount>(`/teams/${slug}`),

  updateTeam: (slug: string, data: UpdateTeamData) =>
    api.put<TeamWithMemberCount>(`/teams/${slug}`, data),

  deleteTeam: (slug: string) => api.delete<void>(`/teams/${slug}`),

  getMembers: (slug: string) =>
    api.get<TeamMemberWithUser[]>(`/teams/${slug}/members`),

  addMember: (slug: string, userId: string, role: string) =>
    api.post<TeamMemberWithUser>(`/teams/${slug}/members`, {
      userId,
      role,
    }),

  updateMember: (slug: string, userId: string, role: string) =>
    api.put<TeamMemberWithUser>(`/teams/${slug}/members`, {
      userId,
      role,
    }),

  removeMember: (slug: string, userId: string) =>
    api.delete<void>(`/teams/${slug}/members`, {
      params: { userId },
    }),

  updateTeamProperties: (slug: string, properties: Partial<TeamProperties>) =>
    api.put<TeamProperties>(`/teams/${slug}/properties`, properties),

  getPermissions: (slug: string) =>
    api.get<Permission[]>(`/teams/${slug}/permissions`),
};
