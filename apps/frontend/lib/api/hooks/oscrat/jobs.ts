import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    queryKey: queryKeys.oscrat.projects.versions.jobs.sbom(teamId, versionId),
    queryFn: () =>
      oscratJobEndpoints.listSbomJobs(teamId, productId, versionId),
    enabled,
  });
}

// Create repository-based SBOM job
export function useCreateRepoSbomJob(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: CreateSbomJobRequest) =>
      oscratJobEndpoints.createRepoSbomJob(teamId, productId, versionId, data),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include job info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Create file-based SBOM job
export function useCreateFileSbomJob(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (formData: FormData) =>
      oscratJobEndpoints.createFileSbomJob(
        teamId,
        productId,
        versionId,
        formData
      ),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include job info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete SBOM job
export function useDeleteSbomJob(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (jobId: string) =>
      oscratJobEndpoints.deleteSbomJob(teamId, productId, versionId, jobId),
    onSuccess: () => {
      // Invalidate SBOM-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.jobs.sbom(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include job info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Invalidate SBOM jobs query
export function useInvalidateSbomJobs() {
  const queryClient = useQueryClient();

  return (teamId: string, versionId: string) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.jobs.sbom(teamId, versionId),
    });
  };
}
