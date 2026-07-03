import { useMutation } from '@tanstack/react-query';
import { attachmentsEndpoints } from '@/lib/api/endpoints/attachments';
import { saveAs } from 'file-saver';

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: ({
      slug,
      attachmentId,
      filename,
    }: {
      slug: string;
      attachmentId: string;
      filename: string;
    }) => {
      return attachmentsEndpoints
        .downloadAttachment(slug, attachmentId)
        .then((blob: Blob) => {
          saveAs(blob, filename);
        });
    },
  });
}
