import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratProjectEndpoints } from '@/lib/api/endpoints/oscrat/projects';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratProductCreate, OscratProductUpdate } from '@oscrat/model';

// List products
export function useGetProducts(teamId: string) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.all(teamId),
    queryFn: () => oscratProjectEndpoints.listProducts(teamId),
  });
}

// Get project detail
export function useGetProjectDetail(
  teamId: string,
  projectId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.detail(teamId, projectId),
    queryFn: () => {
      return oscratProjectEndpoints.getProjectDetail(teamId, projectId);
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Create product
export function useCreateProduct(teamId: string) {
  return useMutation({
    mutationFn: (data: OscratProductCreate) =>
      oscratProjectEndpoints.createProduct(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.all(teamId),
      });
      // Invalidate team products query used by ProductListContent
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.teams.detail(teamId), 'products'],
      });
      // Also invalidate organization data since it includes product summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.summary(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.detail(teamId),
      });
    },
  });
}

// Update project
export function useUpdateProject(teamId: string, projectId: string) {
  return useMutation({
    mutationFn: (data: OscratProductUpdate) =>
      oscratProjectEndpoints.updateProject(teamId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.all(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.detail(teamId, projectId),
      });
      // Also invalidate organization data since it includes product summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.summary(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.detail(teamId),
      });
    },
  });
}

// Delete project
export function useDeleteProject(teamId: string, projectId: string) {
  return useMutation({
    mutationFn: () => {
      return oscratProjectEndpoints.deleteProject(teamId, projectId);
    },
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: queryKeys.oscrat.projects.detail(teamId, projectId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.oscrat.projects.assessments.all(teamId, projectId),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.all(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.teams.detail(teamId), 'products'],
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.summary(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.organization.detail(teamId),
      });
    },
  });
}
