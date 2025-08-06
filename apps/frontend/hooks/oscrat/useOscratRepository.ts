import {
  useGetRepository,
  useGetRepositoryDetail,
  useCreateRepository,
  useUpdateRepository,
  useDeleteRepository,
} from '@/lib/api/hooks/oscrat/repositories';
import type {
  OscratRepositoryCreate,
  OscratRepositoryUpdate,
} from '@oscrat/model';

/**
 * Hook to fetch and manage repository for a specific OSCRAT version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 */
export function useOscratRepository(
  teamId: string,
  productId: string,
  versionId: string
) {
  const {
    data: repository,
    isLoading: isFetchingRepository,
    isError,
    error,
  } = useGetRepository(teamId, productId, versionId);

  const createRepositoryMutation = useCreateRepository(
    teamId,
    productId,
    versionId
  );
  const deleteRepositoryMutation = useDeleteRepository(
    teamId,
    productId,
    versionId,
    repository?.id || ''
  );

  const createRepository = async (data: OscratRepositoryCreate) => {
    return createRepositoryMutation.mutateAsync(data);
  };

  const deleteRepository = async () => {
    if (!repository?.id) {
      throw new Error('No repository to delete');
    }
    return deleteRepositoryMutation.mutateAsync();
  };

  const isLoading =
    isFetchingRepository ||
    createRepositoryMutation.isPending ||
    deleteRepositoryMutation.isPending;

  return {
    repository,
    isLoading,
    isError,
    error,
    createRepository,
    deleteRepository,
    createRepositoryMutation,
    deleteRepositoryMutation,
  };
}

/**
 * Hook to fetch and manage a specific repository detail
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID for the repository
 * @param repositoryId Repository ID for detailed operations
 * @param options Optional configuration to control queries
 */
export function useOscratRepositoryDetail(
  teamId: string,
  productId: string,
  versionId: string,
  repositoryId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  const {
    data: repositoryDetail,
    isLoading: isFetchingRepositoryDetail,
    isError,
    error,
  } = useGetRepositoryDetail(teamId, productId, versionId, repositoryId, {
    enabled,
  });

  const updateRepositoryMutation = useUpdateRepository(
    teamId,
    productId,
    versionId,
    repositoryId
  );
  const deleteRepositoryMutation = useDeleteRepository(
    teamId,
    productId,
    versionId,
    repositoryId
  );

  const updateRepository = async (data: OscratRepositoryUpdate) => {
    return updateRepositoryMutation.mutateAsync(data);
  };

  const isLoading =
    isFetchingRepositoryDetail ||
    updateRepositoryMutation.isPending ||
    deleteRepositoryMutation.isPending;

  return {
    repositoryDetail,
    isLoading,
    isError,
    error,
    updateRepository,
    deleteRepository: deleteRepositoryMutation,
    updateRepositoryMutation,
    deleteRepositoryMutation,
  };
}
