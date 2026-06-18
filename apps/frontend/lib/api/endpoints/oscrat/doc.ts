import { api } from '@/lib/api/client';
import type { Attachment, OscratProductVersionDetail } from '@oscrat/model';

export interface DocUploadResponse {
  attachment: Attachment;
  version: OscratProductVersionDetail;
}

export const docEndpoints = {
  // CAR (Conformity Assessment Report) endpoints
  getCAR: (teamId: string, productId: string, versionId: string) =>
    api.get<Attachment>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/car`
    ),

  uploadCAR: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<DocUploadResponse>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/car`,
      formData,
      { headers: { 'Content-Type': undefined } }
    ),

  deleteCAR: (teamId: string, productId: string, versionId: string) =>
    api.delete<{ version: OscratProductVersionDetail }>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/car`
    ),

  // DoC (Declaration of Conformity) endpoints
  getDoC: (teamId: string, productId: string, versionId: string) =>
    api.get<Attachment>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/doc`
    ),

  uploadDoC: (
    teamId: string,
    productId: string,
    versionId: string,
    formData: FormData
  ) =>
    api.post<DocUploadResponse>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/doc`,
      formData,
      { headers: { 'Content-Type': undefined } }
    ),

  deleteDoC: (teamId: string, productId: string, versionId: string) =>
    api.delete<{ version: OscratProductVersionDetail }>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/doc`
    ),

  // Generic attachment download - used for CAR/DoC downloads
  downloadAttachment: (attachmentId: string) =>
    `/api/attachments/${attachmentId}/download`,
};
