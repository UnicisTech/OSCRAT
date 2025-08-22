import { api } from '@/lib/api/client';

export const attachmentsEndpoints = {
  downloadAttachment: (attachmentId: string) =>
    api.get<Blob>(`/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    }),
};
