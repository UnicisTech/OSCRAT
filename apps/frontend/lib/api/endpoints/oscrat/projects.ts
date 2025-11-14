import { api } from '@/lib/api/client';
import {
  OscratProductSummary,
  OscratProductCreate,
  OscratProductUpdate,
  OscratProductSearchRequest,
  OscratProductSearchResult,
} from '@oscrat/model';
import type { OscratProductDetail } from '@oscrat/model';

export const oscratProjectEndpoints = {
  listProducts: (teamId: string) =>
    api.get<OscratProductSummary[]>(`/teams/${teamId}/products`),

  searchProducts: (teamId: string, params: OscratProductSearchRequest = {}) =>
    api.post<OscratProductSearchResult[]>(
      `/teams/${teamId}/products/search`,
      params
    ),

  createProduct: (teamId: string, data: OscratProductCreate) =>
    api.post<OscratProductDetail>(`/teams/${teamId}/products`, data),

  getProjectDetail: (teamId: string, projectId: string) =>
    api.get<OscratProductDetail>(`/teams/${teamId}/products/${projectId}`),

  updateProject: (
    teamId: string,
    projectId: string,
    data: OscratProductUpdate
  ) =>
    api.put<OscratProductDetail>(
      `/teams/${teamId}/products/${projectId}`,
      data
    ),

  deleteProject: (teamId: string, projectId: string) =>
    api.delete<void>(`/teams/${teamId}/products/${projectId}`),
};
