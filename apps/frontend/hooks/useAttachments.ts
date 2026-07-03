import { useDownloadAttachment } from '@/lib/api/hooks/attachments';

export function useAttachments(slug: string) {
  const downloadAttachmentMutation = useDownloadAttachment();

  const downloadAttachment = async (attachmentId: string, filename: string) => {
    return downloadAttachmentMutation.mutateAsync({
      slug,
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
