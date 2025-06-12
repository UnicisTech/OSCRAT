import { api } from '@/lib/api/client';
import {
  OscratProductSummary,
  OscratProductDetail,
  OscratProductCreate,
  OscratProductUpdate,
} from '@/types/oscrat/product';

export const oscratProjectEndpoints = {
  listProjects: (teamId: string) =>
    api.get<OscratProductSummary[]>(`/teams/${teamId}/oscrat/projects`),

  createProject: (teamId: string, data: OscratProductCreate) =>
    api.post<OscratProductDetail>(`/teams/${teamId}/oscrat/projects`, data),

  getProjectDetail: (teamId: string, projectId: string) =>
    api.get<OscratProductDetail>(
      `/teams/${teamId}/oscrat/projects/${projectId}`
    ),

  updateProject: (
    teamId: string,
    projectId: string,
    data: OscratProductUpdate
  ) =>
    api.put<OscratProductDetail>(
      `/teams/${teamId}/oscrat/projects/${projectId}`,
      data
    ),

  deleteProject: (teamId: string, projectId: string) =>
    api.delete<void>(`/teams/${teamId}/oscrat/projects/${projectId}`),
};
