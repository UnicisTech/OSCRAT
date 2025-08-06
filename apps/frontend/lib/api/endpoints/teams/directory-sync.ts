import { api } from '@/lib/api/client';

export type DirectorySyncConnection = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  provider: string;
  tenant: string;
  product: string;
  scim: {
    endpoint: string;
    token: string;
  };
};

export type CreateDirectorySyncData = {
  name: string;
  provider: string;
};

export const directorySyncEndpoints = {
  getConnection: (slug: string) =>
    api.get<DirectorySyncConnection[]>(`/teams/${slug}/directory-sync`),

  createConnection: (slug: string, data: CreateDirectorySyncData) =>
    api.post<DirectorySyncConnection>(`/teams/${slug}/directory-sync`, data),

  deleteConnection: (slug: string, dsyncId: string) =>
    api.delete<void>(`/teams/${slug}/directory-sync`, {
      params: { dsyncId },
    }),
};
