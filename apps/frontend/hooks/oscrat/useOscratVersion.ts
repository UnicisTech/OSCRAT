import {
  useGetVersions,
  useGetVersionDetail,
  useCreateVersion,
  useUpdateVersion,
  useDeleteVersion,
} from '@/lib/api/hooks/oscrat/versions';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
} from '@oscrat/model';

/**
 * Hook to fetch and manage OSCRAT versions for a specific product
 * @param teamId Team ID
 * @param productId Product ID that owns the versions
 * @param options Optional configuration to control queries
 */
export function useOscratVersions(
  teamId: string,
  productId: string,
  options?: { enabled?: boolean }
) {
  // Use the enabled option directly
  const enabled = options?.enabled !== false;

  const {
    data: versions,
    isLoading: isFetchingVersions,
    isError,
    error,
  } = useGetVersions(teamId, productId, { enabled });

  const createVersionMutation = useCreateVersion(teamId, productId);

  const createVersion = async (data: OscratProductVersionCreate) => {
    return createVersionMutation.mutateAsync(data);
  };

  const isLoading = isFetchingVersions || createVersionMutation.isPending;

  return {
    versions,
    isLoading,
    isError,
    error,
    createVersion,
  };
}

/**
 * Hook to fetch and manage a specific OSCRAT version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID for detailed operations
 * @param options Optional configuration to control queries
 */
export function useOscratVersion(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  // Use the enabled option directly
  const enabled = options?.enabled !== false;

  const {
    data: version,
    isLoading: isFetchingVersion,
    isError,
    error,
  } = useGetVersionDetail(teamId, productId, versionId, { enabled });

  const updateVersionMutation = useUpdateVersion(teamId, productId, versionId);
  const deleteVersionMutation = useDeleteVersion(teamId, productId, versionId);

  const updateVersion = async (data: OscratProductVersionUpdate) => {
    return updateVersionMutation.mutateAsync(data);
  };

  const deleteVersion = async () => {
    return deleteVersionMutation.mutateAsync();
  };

  const isLoading =
    isFetchingVersion ||
    updateVersionMutation.isPending ||
    deleteVersionMutation.isPending;

  return {
    version,
    isLoading,
    isError,
    error,
    updateVersion,
    deleteVersion,
  };
}
