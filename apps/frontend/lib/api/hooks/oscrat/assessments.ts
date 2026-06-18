import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratAssessmentEndpoints } from '@/lib/api/endpoints/oscrat/assessments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratAssessmentCreateRequest } from '@oscrat/model';

export function useFindAssessments(
  teamSlug: string,
  filters?: { productId?: string; versionId?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.assessments.find(teamSlug, filters),
    queryFn: () => oscratAssessmentEndpoints.findAssessments(teamSlug, filters),
    enabled: options?.enabled !== false,
  });
}

export function useGetAssessmentDetail(
  teamSlug: string,
  assessmentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.assessments.detail(teamSlug, assessmentId),
    queryFn: () =>
      oscratAssessmentEndpoints.getAssessmentDetail(teamSlug, assessmentId),
    enabled: options?.enabled !== false && !!assessmentId,
  });
}

export function useCreateAssessment(teamSlug: string) {
  return useMutation({
    mutationFn: (data: OscratAssessmentCreateRequest) =>
      oscratAssessmentEndpoints.createAssessment(teamSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.all(teamSlug),
      });
    },
  });
}

export function useUpdateAssessment(teamSlug: string) {
  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: { schemaVersion?: string; rawData?: Record<string, any> };
    }) =>
      oscratAssessmentEndpoints.updateAssessment(teamSlug, assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.detail(
          teamSlug,
          variables.assessmentId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.all(teamSlug),
      });
    },
  });
}

export function useDeleteAssessment(teamSlug: string) {
  return useMutation({
    mutationFn: (assessmentId: string) =>
      oscratAssessmentEndpoints.deleteAssessment(teamSlug, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.all(teamSlug),
      });
    },
  });
}
