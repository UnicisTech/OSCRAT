import {
  useGetSAMLConfig,
  useCreateSAMLConfig,
  useUpdateSAMLConfig,
  useDeleteSAMLConfig,
} from '@/lib/api/hooks/saml';
import type {
  CreateSamlConnectionData,
  UpdateSamlConnectionData,
} from '@/lib/api/endpoints/teams/saml';

/**
 * Hook to fetch and manage team SAML configuration
 * @param slug Team slug
 */
export function useSAMLConfig(slug: string) {
  const {
    data: samlConfig,
    isLoading: isFetching,
    isError,
    error,
  } = useGetSAMLConfig(slug);

  const createMutation = useCreateSAMLConfig(slug);
  const updateMutation = useUpdateSAMLConfig(slug);
  const deleteMutation = useDeleteSAMLConfig(slug);

  const createSAMLConfig = async (data: CreateSamlConnectionData) => {
    return createMutation.mutateAsync(data);
  };

  const updateSAMLConfig = async (
    clientID: string,
    clientSecret: string,
    data: Partial<UpdateSamlConnectionData>
  ) => {
    return updateMutation.mutateAsync({
      ...data,
      clientID,
      clientSecret,
    });
  };

  const deleteSAMLConfig = async (clientID: string, clientSecret: string) => {
    return deleteMutation.mutateAsync({ clientID, clientSecret });
  };

  const isLoading =
    isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    samlConfig,
    isLoading,
    isError,
    error,
    createSAMLConfig,
    updateSAMLConfig,
    deleteSAMLConfig,
  };
}
