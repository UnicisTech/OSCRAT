import { useCallback } from 'react';
import {
  useGetAssessments,
  useGetAssessmentDetail,
  useCreateAssessment,
  useDeleteAssessment,
} from '@/lib/api/hooks/oscrat/assessments';
import type { OscratAssessmentCreate } from '@oscrat/model';

/**
 * Hook to fetch and manage assessments for a version
 * @param teamId Team ID
 * @param productId Product ID that owns the version
 * @param versionId Version ID
 * @param options Optional configuration to control queries
 */
export function useAssessments(
  teamId: string,
  productId: string,
  versionId: string,
  options?: { enabled?: boolean }
) {
  const {
    data: assessments,
    isLoading: isFetchingAssessments,
    isError,
    error,
  } = useGetAssessments(teamId, productId, versionId, options);

  const createAssessmentMutation = useCreateAssessment(teamId, productId, versionId);

  const createAssessment = useCallback(
    async (data: OscratAssessmentCreate) => {
      return createAssessmentMutation.mutateAsync(data);
    },
    [createAssessmentMutation.mutateAsync]
  );

  const isLoading = isFetchingAssessments || createAssessmentMutation.isPending;

  return {
    assessments,
    isLoading,
    isError,
    error,
    createAssessment,
    isCreating: createAssessmentMutation.isPending,
  };
}

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

  const deleteAssessment = useCallback(
    async () => {
      return deleteAssessmentMutation.mutateAsync();
    },
    [deleteAssessmentMutation.mutateAsync]
  );

  const isLoading = isFetchingAssessment || deleteAssessmentMutation.isPending;

  return {
    assessment,
    isLoading,
    isError,
    error,
    deleteAssessment,
  };
}
