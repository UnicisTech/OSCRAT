import { api } from '@/lib/api/client';
import type { EndpointOut } from 'svix';

export const webhooksEndpoints = {
  getWebhooks: (slug: string) =>
    api.get<EndpointOut[]>(`/teams/${slug}/webhooks`),

  getWebhook: (slug: string, id: string) =>
    api.get<EndpointOut>(`/teams/${slug}/webhooks/${id}`),

  createWebhook: (slug: string, data: Partial<EndpointOut>) =>
    api.post<EndpointOut>(`/teams/${slug}/webhooks`, data),

  updateWebhook: (slug: string, id: string, data: Partial<EndpointOut>) =>
    api.put<EndpointOut>(`/teams/${slug}/webhooks/${id}`, data),

  deleteWebhook: (slug: string, id: string) =>
    api.delete<void>(`/teams/${slug}/webhooks/${id}`),
};
