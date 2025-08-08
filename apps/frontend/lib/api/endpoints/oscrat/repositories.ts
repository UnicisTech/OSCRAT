import { api } from '@/lib/api/client';
import {
  OscratRepositorySummary,
  OscratRepositoryDetail,
  OscratRepositoryCreate,
  OscratRepositoryUpdate,
} from '@oscrat/model';

export const oscratRepositoryEndpoints = {
  getRepository: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratRepositorySummary | null>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/repositories`
    ),

  createRepository: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratRepositoryCreate
  ) =>
    api.post<OscratRepositoryDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/repositories`,
      data
    ),

  getRepositoryDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    repositoryId: string
  ) =>
    api.get<OscratRepositoryDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/repositories/${repositoryId}`
    ),

  updateRepository: (
    teamId: string,
    productId: string,
    versionId: string,
    repositoryId: string,
    data: OscratRepositoryUpdate
  ) =>
    api.put<OscratRepositoryDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/repositories/${repositoryId}`,
      data
    ),

  deleteRepository: (
    teamId: string,
    productId: string,
    versionId: string,
    repositoryId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/repositories/${repositoryId}`
    ),
};
