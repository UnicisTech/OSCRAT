import {
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
} from '@/lib/api/hooks/tasks';

/**
 * Attachment upload data interface
 * Uses the same shape of data as the backend API expects
 */
export interface AttachmentUploadData {
  file: File;
  taskId: number;
}

/**
 * Hook to fetch and manage a task's attachments
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useAttachments(slug: string, taskNumber: string) {
  const uploadMutation = useUploadTaskAttachment(slug, taskNumber);
  const deleteMutation = useDeleteTaskAttachment(slug, taskNumber);

  /**
   * Upload an attachment to a task
   * @param data Upload data containing file and taskId
   */
  const uploadAttachment = async (data: AttachmentUploadData) => {
    return uploadMutation.mutateAsync({
      file: data.file,
      taskId: data.taskId,
      slug,
    });
  };

  /**
   * Delete an attachment from a task
   * @param id Attachment ID to delete
   */
  const deleteAttachment = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    uploadAttachment,
    deleteAttachment,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
