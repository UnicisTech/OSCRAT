import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratRepositoryEndpoints } from '@/lib/api/endpoints/oscrat/repositories';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type {
  OscratRepositoryCreate,
  OscratRepositoryUpdate,
} from '@oscrat/model';

// Get repository for a version
export function useGetRepository(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.repositories.all(
      teamId,
      versionId
    ),
    queryFn: () =>
      oscratRepositoryEndpoints.getRepository(teamId, productId, versionId),
  });
}

// Get repository detail
export function useGetRepositoryDetail(
  teamId: string,
  productId: string,
  versionId: string,
  repositoryId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.versions.repositories.detail(
      teamId,
      versionId,
      repositoryId
    ),
    queryFn: () => {
      return oscratRepositoryEndpoints.getRepositoryDetail(
        teamId,
        productId,
        versionId,
        repositoryId
      );
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Create repository
export function useCreateRepository(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: OscratRepositoryCreate) =>
      oscratRepositoryEndpoints.createRepository(
        teamId,
        productId,
        versionId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.repositories.all(
          teamId,
          versionId
        ),
      });
      // Also invalidate version detail since it may include repository info
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Update repository
export function useUpdateRepository(
  teamId: string,
  productId: string,
  versionId: string,
  repositoryId: string
) {
  return useMutation({
    mutationFn: (data: OscratRepositoryUpdate) =>
      oscratRepositoryEndpoints.updateRepository(
        teamId,
        productId,
        versionId,
        repositoryId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.repositories.all(
          teamId,
          versionId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.repositories.detail(
          teamId,
          versionId,
          repositoryId
        ),
      });
      // Also invalidate version detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}

// Delete repository
export function useDeleteRepository(
  teamId: string,
  productId: string,
  versionId: string,
  repositoryId: string
) {
  return useMutation({
    mutationFn: () => {
      return oscratRepositoryEndpoints.deleteRepository(
        teamId,
        productId,
        versionId,
        repositoryId
      );
    },
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: queryKeys.oscrat.projects.versions.repositories.detail(
          teamId,
          versionId,
          repositoryId
        ),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.repositories.all(
          teamId,
          versionId
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
    },
  });
}
