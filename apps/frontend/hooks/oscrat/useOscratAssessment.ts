import { useCallback } from 'react';
import {
  useFindAssessments,
  useGetAssessmentDetail,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
} from '@/lib/api/hooks/oscrat/assessments';
import type { OscratAssessmentCreateRequest } from '@oscrat/model';

/**
 * Hook to fetch and manage assessments with optional filtering
 * @param teamSlug Team slug
 * @param filters Optional filters (productId, versionId)
 * @param options Optional configuration to control queries
 */
export function useAssessments(
  teamSlug: string,
  filters?: { productId?: string; versionId?: string },
  options?: { enabled?: boolean }
) {
  const {
    data: assessments,
    isLoading: isFetchingAssessments,
    isError,
    error,
  } = useFindAssessments(teamSlug, filters, options);

  const createAssessmentMutation = useCreateAssessment(teamSlug);

  const createAssessment = useCallback(
    async (data: OscratAssessmentCreateRequest) => {
      return createAssessmentMutation.mutateAsync(data);
    },
    [createAssessmentMutation]
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
 * @param teamSlug Team slug
 * @param assessmentId Assessment ID for detailed operations
 */
export function useOscratAssessment(
  teamSlug: string,
  assessmentId: string,
  options?: { enabled?: boolean }
) {
  const {
    data: assessment,
    isLoading: isFetchingAssessment,
    isError,
    error,
  } = useGetAssessmentDetail(teamSlug, assessmentId, options);

  const updateAssessmentMutation = useUpdateAssessment(teamSlug);
  const deleteAssessmentMutation = useDeleteAssessment(teamSlug);

  const updateAssessment = useCallback(
    async (data: { schemaVersion?: string; rawData?: Record<string, any> }) => {
      return updateAssessmentMutation.mutateAsync({ assessmentId, data });
    },
    [updateAssessmentMutation, assessmentId]
  );

  const deleteAssessment = useCallback(async () => {
    return deleteAssessmentMutation.mutateAsync(assessmentId);
  }, [deleteAssessmentMutation, assessmentId]);

  const isLoading =
    isFetchingAssessment ||
    updateAssessmentMutation.isPending ||
    deleteAssessmentMutation.isPending;

  return {
    assessment,
    isLoading,
    isError,
    error,
    updateAssessment,
    deleteAssessment,
  };
}
