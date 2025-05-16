import { api } from '@/lib/api/client';

export const idpEndpoints = {
  getMetadata: () => api.get<Record<string, string>>('/idp'),
};
