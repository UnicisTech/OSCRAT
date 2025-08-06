import {
  useGetAssessmentDetail,
  useDeleteAssessment,
} from '@/lib/api/hooks/oscrat/assessments';

/**
 * Hook to fetch and manage a specific OSCRAT assessment
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID that owns the assessment
 * @param assessmentId Assessment ID for detailed operations
 */
export function useOscratAssessment(
  teamId: string,
  productId: string,
  versionId: string,
  assessmentId: string
) {
  const {
    data: assessment,
    isLoading: isFetchingAssessment,
    isError,
    error,
  } = useGetAssessmentDetail(teamId, productId, versionId, assessmentId);

  const deleteAssessmentMutation = useDeleteAssessment(
    teamId,
    productId,
    versionId,
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
