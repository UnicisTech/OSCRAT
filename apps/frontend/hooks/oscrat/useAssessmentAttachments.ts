import {
  useGetAssessmentAttachments,
  useUploadAssessmentAttachment,
  useDeleteAssessmentAttachment,
} from '@/lib/api/hooks/oscrat/assessmentAttachments';
import { useAttachments } from '@/hooks/useAttachments';

export function useAssessmentAttachments(
  teamSlug: string,
  assessmentId: string,
  options?: { enabled?: boolean }
) {
  const baseAttachments = useAttachments();

  const enabled = options?.enabled !== false && !!assessmentId;

  const {
    data: attachments,
    isLoading: isFetchingAttachments,
    isError,
    error,
  } = useGetAssessmentAttachments(teamSlug, assessmentId, { enabled });

  const uploadAttachmentMutation = useUploadAssessmentAttachment(
    teamSlug,
    assessmentId
  );
  const deleteAttachmentMutation = useDeleteAssessmentAttachment(
    teamSlug,
    assessmentId
  );

  const uploadAttachment = async (file: File, description?: string) => {
    return uploadAttachmentMutation.mutateAsync({ file, description });
  };

  const deleteAttachment = async (attachmentId: string) => {
    return deleteAttachmentMutation.mutateAsync(attachmentId);
  };

  const isLoading =
    isFetchingAttachments ||
    uploadAttachmentMutation.isPending ||
    deleteAttachmentMutation.isPending;

  return {
    ...baseAttachments,
    attachments: attachments || [],
    isLoading,
    isError,
    error,
    uploadAttachment,
    deleteAttachment,
    uploadAttachmentMutation,
    deleteAttachmentMutation,
  };
}
