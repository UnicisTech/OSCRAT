import { useDownloadAttachment } from '@/lib/api/hooks/attachments';

export function useAttachments() {
  const downloadAttachmentMutation = useDownloadAttachment();

  const downloadAttachment = async (attachmentId: string, filename: string) => {
    return downloadAttachmentMutation.mutateAsync({
      attachmentId,
      filename,
    });
  };

  return {
    downloadAttachment,
    downloadAttachmentMutation,
    isDownloading: downloadAttachmentMutation.isPending,
  };
}
