import { api } from '@/lib/api/client';
import { SAMLConnection } from '@/types/saml';

export type CreateSamlConnectionData = {
  metadataUrl?: string;
  encodedRawMetadata?: string;
};

export type UpdateSamlConnectionData = CreateSamlConnectionData & {
  clientID?: string;
  clientSecret?: string;
  deactivated?: boolean;
};

export const samlEndpoints = {
  getConnection: (slug: string) =>
    api.get<SAMLConnection[]>(`/teams/${slug}/saml`),

  createConnection: (slug: string, data: CreateSamlConnectionData) =>
    api.post<SAMLConnection>(`/teams/${slug}/saml`, data),

  updateConnection: (slug: string, data: UpdateSamlConnectionData) =>
    api.patch<SAMLConnection>(`/teams/${slug}/saml`, data),

  deleteConnection: (slug: string, clientID: string, clientSecret: string) =>
    api.delete<void>(`/teams/${slug}/saml`, {
      params: { clientID, clientSecret },
    }),
};
