import { api } from '@/lib/api/client';
import { SbomWorkerJob } from '@oscrat/model';

export interface CreateSbomJobRequest {
  repositoryId: string;
}

export const oscratJobEndpoints = {
  listSbomJobs: (teamId: string, productId: string, versionId: string) =>
    api.get<SbomWorkerJob[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom`
    ),

  createSbomJob: (
    teamId: string,
    productId: string,
    versionId: string,
    data: CreateSbomJobRequest
  ) =>
    api.post<SbomWorkerJob>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/jobs/sbom`,
      data
    ),
};
