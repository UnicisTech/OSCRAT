import { api } from '@/lib/api/client';
import type { Attachment } from '@/types';

export const assessmentAttachmentsEndpoints = {
  getAssessmentAttachments: (teamSlug: string, assessmentId: string) =>
    api.get<Attachment[]>(
      `/teams/${teamSlug}/assessments/${assessmentId}/attachments`
    ),

  uploadAssessmentAttachment: (
    teamSlug: string,
    assessmentId: string,
    formData: FormData
  ) =>
    api.post<Attachment>(
      `/teams/${teamSlug}/assessments/${assessmentId}/attachments`,
      formData,
      { headers: { 'Content-Type': undefined } }
    ),

  deleteAssessmentAttachment: (
    teamSlug: string,
    assessmentId: string,
    attachmentId: string
  ) =>
    api.delete<void>(
      `/teams/${teamSlug}/assessments/${assessmentId}/attachments?id=${attachmentId}`
    ),
};
