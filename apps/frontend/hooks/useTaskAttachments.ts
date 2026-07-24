import {
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
} from '@/lib/api/hooks/tasks';
import { useAttachments } from '@/hooks/useAttachments';

export interface AttachmentUploadData {
  file: File;
  description?: string;
}

/**
 * Hook to fetch and manage a task's attachments
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useTaskAttachments(slug: string, taskNumber: string) {
  // Get common attachment functionality
  const baseAttachments = useAttachments(slug);

  const uploadMutation = useUploadTaskAttachment(slug, taskNumber);
  const deleteMutation = useDeleteTaskAttachment(slug, taskNumber);

  const uploadAttachment = async (data: AttachmentUploadData) => {
    return uploadMutation.mutateAsync({
      file: data.file,
      description: data.description,
    });
  };

  const deleteAttachment = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const isLoading =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    baseAttachments.isDownloading;

  return {
    ...baseAttachments,
    uploadAttachment,
    deleteAttachment,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading,
    uploadMutation,
    deleteMutation,
  };
}
