import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentAttachmentsEndpoints } from '@/lib/api/endpoints/oscrat/assessmentAttachments';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

// Get assessment attachments
export function useGetAssessmentAttachments(
  teamSlug: string,
  assessmentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.oscrat.assessments.attachments(teamSlug, assessmentId),
    queryFn: () =>
      assessmentAttachmentsEndpoints.getAssessmentAttachments(
        teamSlug,
        assessmentId
      ),
    enabled: options?.enabled !== false && !!assessmentId,
  });
}

// Upload assessment attachment
export function useUploadAssessmentAttachment(
  teamSlug: string,
  assessmentId: string
) {
  return useMutation({
    mutationFn: (data: { file: File; description?: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.description) {
        formData.append('description', data.description);
      }

      return assessmentAttachmentsEndpoints.uploadAssessmentAttachment(
        teamSlug,
        assessmentId,
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.attachments(
          teamSlug,
          assessmentId
        ),
        exact: false,
      });
    },
  });
}

// Delete assessment attachment
export function useDeleteAssessmentAttachment(
  teamSlug: string,
  assessmentId: string
) {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      assessmentAttachmentsEndpoints.deleteAssessmentAttachment(
        teamSlug,
        assessmentId,
        attachmentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.oscrat.assessments.attachments(
          teamSlug,
          assessmentId
        ),
        exact: false,
      });
    },
  });
}
