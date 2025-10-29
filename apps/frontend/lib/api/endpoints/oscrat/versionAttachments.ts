import { api } from '@/lib/api/client';
import type { Attachment } from '@/types';
import type { AttachmentEntityFilters } from '@oscrat/model/types/attachments';

export const versionAttachmentsEndpoints = {
  getVersionAttachments: (
    teamId: string,
    productId: string,
    versionId: string,
    filters?: AttachmentEntityFilters
  ) => {
    const params = new URLSearchParams();
    if (filters?.vulnerabilityId) {
      params.append('vulnerabilityId', filters.vulnerabilityId);
    }
    if (filters?.incidentId) {
      params.append('incidentId', filters.incidentId);
    }
    const queryString = params.toString();

    return api.get<Attachment[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/attachments${
        queryString ? `?${queryString}` : ''
      }`
    );
  },

  uploadVersionAttachment: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<Attachment>(
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
