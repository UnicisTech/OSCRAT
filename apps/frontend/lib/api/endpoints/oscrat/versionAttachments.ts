import { api } from '@/lib/api/client';
import type { Attachment } from '@/types';

export const versionAttachmentsEndpoints = {
  getVersionAttachments: (teamId: string, productId: string, versionId: string) =>
    api.get<Attachment[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/attachments`
    ),

  uploadVersionAttachment: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<{ url: string }>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    ),


  deleteVersionAttachment: (
    teamId: string,
    productId: string,
    versionId: string,
    attachmentId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/attachments?id=${attachmentId}`
    ),
};