import { ApiResponse } from '@/types';
import { api } from '@/lib/api/client';

export type TokenRequest = {
  grant_type: string;
  code?: string;
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
};

export type OAuthUserInfo = {
  sub: string;
  name: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
};

export const oauthEndpoints = {
  authorize: (
    response_type: string,
    client_id: string,
    redirect_uri: string,
    state?: string,
    scope?: string
  ) =>
    api.get<ApiResponse<void>>(
      `/oauth/authorize?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}${state ? `&state=${state}` : ''}${scope ? `&scope=${scope}` : ''}`
    ),

  token: (data: TokenRequest) =>
    api.post<ApiResponse<{ access_token: string; token_type: string }>>(
      '/oauth/token',
      data
    ),

  userinfo: (token: string) =>
    api.get<ApiResponse<OAuthUserInfo>>('/oauth/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  saml: (teamSlug: string, clientID: string) =>
    api.get<ApiResponse<void>>(
      `/oauth/saml?team=${teamSlug}&client_id=${clientID}`
    ),
};
