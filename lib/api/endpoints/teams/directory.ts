import { api } from '@/lib/api/client';
import { Directory } from '@boxyhq/saml-jackson';

export const directoryEndpoints = {
  getDirectories: (slug: string) =>
    api.get<Directory[]>(`/teams/${slug}/directory-sync`),

  createDirectory: (
    slug: string,
    data: {
      name: string;
      provider: string;
      settings: Record<string, string>;
    }
  ) => api.post<Directory>(`/teams/${slug}/directory-sync`, data),

  updateDirectory: (
    slug: string,
    id: string,
    data: {
      name?: string;
      provider?: string;
      settings?: Record<string, string>;
    }
  ) => api.put<Directory>(`/teams/${slug}/directory-sync/${id}`, data),

  deleteDirectory: (slug: string, id: string) =>
    api.delete<void>(`/teams/${slug}/directory-sync/${id}`),

  syncDirectory: (slug: string, id: string) =>
    api.post<void>(`/teams/${slug}/directory-sync/${id}/sync`, {}),
};
