import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  samlEndpoints,
  CreateSamlConnectionData,
  UpdateSamlConnectionData,
} from '@/lib/api/endpoints/teams/saml';
import { queryKeys } from '../queryKeys';
import type { SAMLConnection } from '@/types/saml';

export function useGetSAMLConfig(slug: string) {
  return useQuery<SAMLConnection[]>({
    queryKey: queryKeys.teams.saml(slug),
    queryFn: () => samlEndpoints.getConnection(slug),
  });
}

export function useCreateSAMLConfig(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.teams.saml(slug);

  return useMutation({
    mutationFn: (data: CreateSamlConnectionData) =>
      samlEndpoints.createConnection(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateSAMLConfig(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.teams.saml(slug);

  return useMutation({
    mutationFn: (data: UpdateSamlConnectionData) =>
      samlEndpoints.updateConnection(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteSAMLConfig(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.teams.saml(slug);

  return useMutation({
    mutationFn: ({
      clientID,
      clientSecret,
    }: {
      clientID: string;
      clientSecret: string;
    }) => samlEndpoints.deleteConnection(slug, clientID, clientSecret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
