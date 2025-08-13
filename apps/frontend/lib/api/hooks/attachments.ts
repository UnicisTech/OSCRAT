import { useMutation } from '@tanstack/react-query';
import { attachmentsEndpoints } from '@/lib/api/endpoints/attachments';
import { saveAs } from 'file-saver';

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: ({
      attachmentId,
      filename,
    }: {
      attachmentId: string;
      filename: string;
    }) =>
      attachmentsEndpoints
        .downloadAttachment(attachmentId)
        .then((blob: Blob) => {
          saveAs(blob, filename);
        }),
  });
}