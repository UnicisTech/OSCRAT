import {
  TeamMemberWithUser,
  TeamProperties,
} from '@/types';
import { api } from '@/lib/api/client';
import { 
  Team, 
  TeamSummary, 
  TeamWithProducts,
  TeamSettingsUpdate,
  OscratProductSummary,
} from '@oscrat/model';
import { Permission } from '@/lib/permissions';

export const teamsEndpoints = {
  list: () => api.get<TeamSummary[]>('/teams'),

  create: (name: string, slug: string) =>
    api.post<Team>('/teams', { name, slug }),

  getTeam: (slug: string) => api.get<Team>(`/teams/${slug}`),
  
  getTeamProducts: (slug: string) => 
    api.get<OscratProductSummary[]>(`/teams/${slug}/products`),

  updateTeam: (slug: string, data: TeamSettingsUpdate) =>
    api.put<Team>(`/teams/${slug}`, data),

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
