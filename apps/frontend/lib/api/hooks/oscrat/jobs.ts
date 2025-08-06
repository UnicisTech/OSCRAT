import { useQuery, useMutation } from '@tanstack/react-query';
import {
  oscratJobEndpoints,
  CreateSbomJobRequest,
} from '@/lib/api/endpoints/oscrat/jobs';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import { WorkerJobType } from '@oscrat/model';

// List SBOM jobs specifically
export function useGetSbomJobs(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;

  return useQuery({
    queryKey: queryKeys.oscrat.projects.jobs.sbom(teamId, versionId),
    queryFn: () =>
      oscratJobEndpoints.listSbomJobs(teamId, productId, versionId),
    enabled,
  });
}

// Create SBOM job
export function useCreateSbomJob(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: CreateSbomJobRequest) =>
      oscratJobEndpoints.createSbomJob(teamId, productId, versionId, data),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.jobs.sbom(teamId, versionId),
      });
      // Also invalidate version detail since it may include job info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}
