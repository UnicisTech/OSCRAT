import { api } from '@/lib/api/client';
import {
  OscratOrganizationSummary,
  OscratOrganizationDetail,
  OscratOrganizationCreate,
  OscratOrganizationUpdate,
} from '@/types/oscrat/organisation';

export const oscratOrganizationEndpoints = {
  getOrganizationSummary: (teamId: string) =>
    api.get<OscratOrganizationSummary>(`/teams/${teamId}/oscrat`),

  getOrganizationDetail: (teamId: string) =>
    api.get<OscratOrganizationDetail>(`/teams/${teamId}/oscrat`),

  createOrganization: (teamId: string, data: OscratOrganizationCreate) =>
    api.post<OscratOrganizationDetail>(`/teams/${teamId}/oscrat`, data),

  updateOrganization: (teamId: string, data: OscratOrganizationUpdate) =>
    api.put<OscratOrganizationDetail>(`/teams/${teamId}/oscrat`, data),
};
