import type {
  WorkerJob,
  SbomWorkerJob,
  RepoGenerateSbomResult,
} from '@oscrat/model';

/**
 * Helper to create SBOM job for a repository
 */
export const createSbomJobForRepository = async (
  createSbomJob: (data: { repositoryId: string }) => Promise<SbomWorkerJob>,
  repositoryId: string
): Promise<SbomWorkerJob> => {
  return await createSbomJob({ repositoryId });
};

/**
 * Get SBOM result from a completed job
 */
export const getSbomResult = (
  job: WorkerJob
): RepoGenerateSbomResult | null => {
  if (!job.result) {
    return null;
  }
  return job.result as unknown as RepoGenerateSbomResult;
};
