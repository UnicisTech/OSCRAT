import {
  useGetSbomJobs,
  useCreateRepoSbomJob,
  useCreateFileSbomJob,
  useDeleteSbomJob,
  useInvalidateSbomJobs,
} from '@/lib/api/hooks/oscrat/jobs';
import type { CreateSbomJobRequest } from '@/lib/api/endpoints/oscrat/jobs';
import type { SbomWorkerJob } from '@oscrat/model';

/**
 * Hook specifically for SBOM jobs for a version (both REPO and FILE types)
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

  // Mutations for different job operations
  const createRepoSbomJobMutation = useCreateRepoSbomJob(
    teamId,
    productId,
    versionId
  );
  const createFileSbomJobMutation = useCreateFileSbomJob(
    teamId,
    productId,
    versionId
  );
  const deleteSbomJobMutation = useDeleteSbomJob(teamId, productId, versionId);
  const invalidateSbomJobs = useInvalidateSbomJobs();

  const createRepoSbomJob = async (data: CreateSbomJobRequest) => {
    return createRepoSbomJobMutation.mutateAsync(data);
  };

  const createFileSbomJob = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return createFileSbomJobMutation.mutateAsync(formData);
  };

  const deleteSbomJob = async (jobId: string) => {
    return deleteSbomJobMutation.mutateAsync(jobId);
  };

  const refreshJobs = () => {
    return invalidateSbomJobs(teamId, versionId);
  };

  const isLoading =
    isFetchingJobs ||
    createRepoSbomJobMutation.isPending ||
    createFileSbomJobMutation.isPending ||
    deleteSbomJobMutation.isPending;

  return {
    jobs,
    isLoading,
    isError,
    error,
    createRepoSbomJob,
    createFileSbomJob,
    deleteSbomJob,
    refreshJobs,
  };
}
