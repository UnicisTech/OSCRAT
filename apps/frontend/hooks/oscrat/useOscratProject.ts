import {
  useGetProjectDetail,
  useCreateProduct,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/api/hooks/oscrat/projects';
import type { OscratProductCreate, OscratProductUpdate } from '@oscrat/model';

/**
 * Hook to fetch and manage a specific OSCRAT project
 * @param teamId Team ID
 * @param projectId Project ID for detailed operations
 * @param options Optional configuration to control queries
 */
export function useOscratProject(
  teamId: string,
  projectId: string,
  options?: { enabled?: boolean }
) {
  const deleteProjectMutation = useDeleteProject(teamId, projectId);

  // Use the enabled option directly
  const enabled = options?.enabled !== false;

  const {
    data: project,
    isLoading: isFetchingProject,
    isError,
    error,
  } = useGetProjectDetail(teamId, projectId, { enabled });

  const createProductMutation = useCreateProduct(teamId);
  const updateProjectMutation = useUpdateProject(teamId, projectId);

  const createProject = async (data: OscratProductCreate) => {
    return createProductMutation.mutateAsync(data);
  };

  const updateProject = async (data: OscratProductUpdate) => {
    return updateProjectMutation.mutateAsync(data);
  };

  const isLoading =
    isFetchingProject ||
    createProductMutation.isPending ||
    updateProjectMutation.isPending ||
    deleteProjectMutation.isPending;

  return {
    project,
    isLoading,
    isError,
    error,
    createProject,
    updateProject,
    deleteProject: deleteProjectMutation,
  };
}
