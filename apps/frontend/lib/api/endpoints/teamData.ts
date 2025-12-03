import { api } from '@/lib/api/client';
import type {
  TeamData,
  TeamDataSummary,
  TeamDataDetail,
} from '@oscrat/model/types/teamData';

export type TeamDataUpsertRequest = {
  dataKey: string;
  payload: string;
};

export type TeamDataUpdateRequest = {
  payload: string;
};

export const teamDataEndpoints = {
  list: (slug: string) => api.get<TeamDataSummary[]>(`/teams/${slug}/data`),

  get: (slug: string, dataKey: string) =>
    api.get<TeamDataDetail>(
      `/teams/${slug}/data/${encodeURIComponent(dataKey)}`
    ),

  upsert: (slug: string, data: TeamDataUpsertRequest) =>
    api.post<TeamData>(`/teams/${slug}/data`, data),

  update: (slug: string, dataKey: string, data: TeamDataUpdateRequest) =>
    api.put<TeamData>(
      `/teams/${slug}/data/${encodeURIComponent(dataKey)}`,
      data
    ),

  delete: (slug: string, dataKey: string) =>
    api.delete<void>(`/teams/${slug}/data/${encodeURIComponent(dataKey)}`),
};
