import { useQuery, useMutation } from '@tanstack/react-query';
import { oscratAssessmentEndpoints } from '@/lib/api/endpoints/oscrat/assessments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { OscratAssessmentCreate } from '@/types/oscrat/assessment';

// List assessments
export function useGetAssessments(
  teamId: string,
  projectId: string,
  options?: { enabled?: boolean }
) {
  const result = useQuery({
    queryKey: queryKeys.oscrat.projects.assessments.all(teamId, projectId),
    queryFn: () => {
      return oscratAssessmentEndpoints.listAssessments(teamId, projectId);
    },
    enabled: options?.enabled !== false,
  });

  return result;
}

// Get assessment detail
export function useGetAssessmentDetail(
  teamId: string,
  projectId: string,
  assessmentId: string
) {
  return useQuery({
    queryKey: queryKeys.oscrat.projects.assessments.detail(
      teamId,
      projectId,
      assessmentId
    ),
    queryFn: () =>
      oscratAssessmentEndpoints.getAssessmentDetail(
        teamId,
        projectId,
        assessmentId
      ),
  });
}

// Create assessment
export function useCreateAssessment(teamId: string, projectId: string) {
  return useMutation({
    mutationFn: (data: OscratAssessmentCreate) =>
      oscratAssessmentEndpoints.createAssessment(teamId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.assessments.all(teamId, projectId),
      });
      // Also invalidate project detail since it might include assessment summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.detail(teamId, projectId),
      });
    },
  });
}

// Delete assessment
export function useDeleteAssessment(
  teamId: string,
  projectId: string,
  assessmentId: string
) {
  return useMutation({
    mutationFn: () =>
      oscratAssessmentEndpoints.deleteAssessment(
        teamId,
        projectId,
        assessmentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.assessments.all(teamId, projectId),
      });
      // Also invalidate project detail since it might include assessment summaries
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.projects.detail(teamId, projectId),
      });
    },
  });
}
