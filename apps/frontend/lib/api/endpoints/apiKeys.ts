import { ApiKey } from '@oscrat/model';
import { api } from '@/lib/api/client';

export const apiKeysEndpoints = {
  // Get all API keys for a team
  list: (teamSlug: string) => api.get<ApiKey[]>(`/teams/${teamSlug}/api-keys`),

  // Create a new API key
  create: (teamSlug: string, name: string) =>
    api.post<{ apiKey: string }>(`/teams/${teamSlug}/api-keys`, { name }),

  // Delete an API key
  delete: (teamSlug: string, apiKeyId: string) =>
    api.delete<void>(`/teams/${teamSlug}/api-keys/${apiKeyId}`),
};
