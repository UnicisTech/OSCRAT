import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratVersionEndpoints } from '@/lib/api/endpoints/oscrat/versions';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
} from '@oscrat/model';

// List versions for a product
export function useGetVersions(
  teamId: string,
  productId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.all(teamId, productId),
    queryFn: () => oscratVersionEndpoints.listVersions(teamId, productId),
    enabled: options?.enabled !== false,
  });
}

// Get version detail
export function useGetVersionDetail(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
    queryFn: () =>
      oscratVersionEndpoints.getVersionDetail(teamId, productId, versionId),
    enabled: options?.enabled !== false,
  });
}

// Create version
export function useCreateVersion(teamId: string, productId: string) {
  return useMutation({
    mutationFn: (data: OscratProductVersionCreate) =>
      oscratVersionEndpoints.createVersion(teamId, productId, data),
    onSuccess: (newVersion) => {
      // Invalidate the versions list for the product
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.all(
          teamId,
          newVersion.productId
        ),
      });
      // Invalidate the product detail since it includes versions
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.detail(
          teamId,
          newVersion.productId
        ),
      });
    },
  });
}

// Update version
export function useUpdateVersion(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: (data: OscratProductVersionUpdate) =>
      oscratVersionEndpoints.updateVersion(teamId, productId, versionId, data),
    onSuccess: (updatedVersion) => {
      // Invalidate the specific version detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
      // Invalidate the versions list for the product
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.versions.all(
          teamId,
          updatedVersion.productId
        ),
      });
      // Invalidate the product detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.detail(
          teamId,
          updatedVersion.productId
        ),
      });
    },
  });
}

// Delete version
export function useDeleteVersion(
  teamId: string,
  productId: string,
  versionId: string
) {
  return useMutation({
    mutationFn: () =>
      oscratVersionEndpoints.deleteVersion(teamId, productId, versionId),
    onSuccess: () => {
      // Remove the specific version detail from cache
      queryClient.removeQueries({
        queryKey: queryKeys.oscrat.projects.versions.detail(teamId, versionId),
      });
      // Invalidate all version lists and project details
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.all(teamId),
      });
    },
  });
}
