import {
  useGetProjectDetail,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/api/hooks/oscrat/projects';
import {
  useGetAssessments,
  useCreateAssessment,
} from '@/lib/api/hooks/oscrat/assessments';
import type {
  OscratProductCreate,
  OscratProductUpdate,
} from '@/types/oscrat/product';
import type { OscratAssessmentCreate } from '@/types/oscrat/assessment';

/**
 * Hook to fetch and manage a specific OSCRAT project and its assessments
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

  const { data: assessments, isLoading: isFetchingAssessments } =
    useGetAssessments(teamId, projectId, { enabled });

  const createProjectMutation = useCreateProject(teamId);
  const updateProjectMutation = useUpdateProject(teamId, projectId);
  const createAssessmentMutation = useCreateAssessment(teamId, projectId);

  const createProject = async (data: OscratProductCreate) => {
    return createProjectMutation.mutateAsync(data);
  };

  const updateProject = async (data: OscratProductUpdate) => {
    return updateProjectMutation.mutateAsync(data);
  };

  const createAssessment = async (data: OscratAssessmentCreate) => {
    return createAssessmentMutation.mutateAsync(data);
  };

  const isLoading =
    isFetchingProject ||
    isFetchingAssessments ||
    createProjectMutation.isPending ||
    updateProjectMutation.isPending ||
    deleteProjectMutation.isPending ||
    createAssessmentMutation.isPending;

  return {
    project,
    assessments,
    isLoading,
    isError,
    error,
    createProject,
    updateProject,
    deleteProject: deleteProjectMutation,
    createAssessment,
  };
}
