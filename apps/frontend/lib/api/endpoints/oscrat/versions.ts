import { api } from '@/lib/api/client';
import type {
  OscratProductVersionSummary,
  OscratProductVersionDetail,
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
} from '@oscrat/model';

export const oscratVersionEndpoints = {
  listVersions: (teamId: string, productId: string) =>
    api.get<OscratProductVersionSummary[]>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions`
    ),

  getVersionDetail: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratProductVersionDetail>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}`
    ),

  createVersion: (
    teamId: string,
    productId: string,
    data: OscratProductVersionCreate
  ) =>
    api.post<OscratProductVersionDetail>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions`,
      data
    ),

  updateVersion: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratProductVersionUpdate
  ) =>
    api.put<OscratProductVersionDetail>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}`,
      data
    ),

  deleteVersion: (teamId: string, productId: string, versionId: string) =>
    api.delete<void>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}`
    ),
};
