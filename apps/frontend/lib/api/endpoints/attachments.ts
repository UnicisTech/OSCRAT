import { api } from '@/lib/api/client';

export const attachmentsEndpoints = {
  downloadAttachment: (slug: string, attachmentId: string) =>
    api.get<Blob>(`/teams/${slug}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    }),
};
