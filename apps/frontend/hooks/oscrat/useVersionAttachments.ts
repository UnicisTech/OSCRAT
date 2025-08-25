import {
  useGetVersionAttachments,
  useUploadVersionAttachment,
  useDeleteVersionAttachment,
} from '@/lib/api/hooks/oscrat/versionAttachments';
import { useAttachments } from '@/hooks/useAttachments';

export function useVersionAttachments(
  teamId: string,
  productId: string,
  versionId: string
) {
  // Get common attachment functionality
  const baseAttachments = useAttachments();

  const {
    data: attachments,
    isLoading: isFetchingAttachments,
    isError,
    error,
  } = useGetVersionAttachments(teamId, productId, versionId);

  const uploadAttachmentMutation = useUploadVersionAttachment(
    teamId,
    productId,
    versionId
  );
  const deleteAttachmentMutation = useDeleteVersionAttachment(
    teamId,
    productId,
    versionId
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

  const isDownloading = baseAttachments.isDownloading;

  return {
    ...baseAttachments,
    attachments: attachments || [],
    isLoading,
    isDownloading,
    isError,
    error,
    uploadAttachment,
    deleteAttachment,
    uploadAttachmentMutation,
    deleteAttachmentMutation,
  };
}
