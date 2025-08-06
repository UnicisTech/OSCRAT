import type { WorkerJob, RepoGenerateSbomResult } from '@oscrat/model';

/**
 * Helper to create SBOM job for a repository
 */
export const createSbomJobForRepository = async (
  createSbomJob: (data: { repositoryId: string }) => Promise<WorkerJob>,
  repositoryId: string
): Promise<WorkerJob> => {
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
