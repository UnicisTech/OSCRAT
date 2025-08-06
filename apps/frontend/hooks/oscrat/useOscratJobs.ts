import { useGetSbomJobs, useCreateSbomJob } from '@/lib/api/hooks/oscrat/jobs';
import type { CreateSbomJobRequest } from '@/lib/api/endpoints/oscrat/jobs';

/**
 * Hook specifically for SBOM jobs for a version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param options Optional configuration to control queries
 */
export function useOscratVersionSbomJobs(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  const {
    data: jobs,
    isLoading: isFetchingJobs,
    isError,
    error,
  } = useGetSbomJobs(teamId, productId, versionId, { enabled });

  const createSbomJobMutation = useCreateSbomJob(teamId, productId, versionId);

  const createSbomJob = async (data: CreateSbomJobRequest) => {
    return createSbomJobMutation.mutateAsync(data);
  };

  const isLoading = isFetchingJobs || createSbomJobMutation.isPending;

  return {
    jobs,
    isLoading,
    isError,
    error,
    createSbomJob,
    createSbomJobMutation,
  };
}
