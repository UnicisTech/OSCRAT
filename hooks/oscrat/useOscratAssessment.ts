import {
  useGetAssessmentDetail,
  useDeleteAssessment,
} from '@/lib/api/hooks/oscrat/assessments';

/**
 * Hook to fetch and manage a specific OSCRAT assessment
 * @param teamId Team ID
 * @param projectId Project ID that owns the assessment
 * @param assessmentId Assessment ID for detailed operations
 */
export function useOscratAssessment(
  teamId: string,
  projectId: string,
  assessmentId: string
) {
  const {
    data: assessment,
    isLoading: isFetchingAssessment,
    isError,
    error,
  } = useGetAssessmentDetail(teamId, projectId, assessmentId);

  const deleteAssessmentMutation = useDeleteAssessment(
    teamId,
    projectId,
    assessmentId
  );

  const deleteAssessment = async () => {
    return deleteAssessmentMutation.mutateAsync();
  };

  const isLoading = isFetchingAssessment || deleteAssessmentMutation.isPending;

  return {
    assessment,
    isLoading,
    isError,
    error,
    deleteAssessment,
  };
}
