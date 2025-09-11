import { api } from '@/lib/api/client';
import { SbomWorkerJob } from '@oscrat/model';

export interface CreateSbomJobRequest {
  repositoryId: string;
}

export const oscratJobEndpoints = {
  // Unified retrieval - returns both REPO and FILE jobs
  listSbomJobs: (teamId: string, productId: string, versionId: string) =>
    api.get<SbomWorkerJob[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom`
    ),

  // Repository-based SBOM job creation
  createRepoSbomJob: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateSbomJobRequest
  ) =>
    api.post<SbomWorkerJob>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom-generated`,
      data
    ),

  // File-based SBOM job creation
  createFileSbomJob: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<SbomWorkerJob>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom-imports`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    ),

  // Delete SBOM job
  deleteSbomJob: (
    teamId: string,
    productId: string,
    versionId: string,
    jobId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom/${jobId}`
    ),
};
