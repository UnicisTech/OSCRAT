import { useMutation } from '@tanstack/react-query';
import { oauthEndpoints } from '@/lib/api/endpoints/oauth';
import type { TokenRequest } from '@/lib/api/endpoints/oauth';

export function useCreateOAuthToken() {
  return useMutation({
    mutationFn: (data: TokenRequest) => oauthEndpoints.token(data),
  });
}

export function useGetOAuthUserInfo() {
  return useMutation({
    mutationFn: (token: string) => oauthEndpoints.userinfo(token),
  });
}

export function useCreateOAuthAuthorization() {
  return useMutation({
    mutationFn: ({
      response_type,
      client_id,
      redirect_uri,
      state,
      scope,
    }: {
      response_type: string;
      client_id: string;
      redirect_uri: string;
      state?: string;
      scope?: string;
    }) =>
      oauthEndpoints.authorize(
        response_type,
        client_id,
        redirect_uri,
        state,
        scope
      ),
  });
}

export function useCreateOAuthSaml() {
  return useMutation({
    mutationFn: ({
      teamSlug,
      clientID,
    }: {
      teamSlug: string;
      clientID: string;
    }) => oauthEndpoints.saml(teamSlug, clientID),
  });
}
