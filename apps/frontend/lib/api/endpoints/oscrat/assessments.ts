import { api } from '@/lib/api/client';
import {
  OscratAssessmentSummary,
  OscratAssessmentDetail,
  OscratAssessmentCreateRequest,
} from '@oscrat/model';

export const oscratAssessmentEndpoints = {
  findAssessments: (
    teamSlug: string,
    filters?: { productId?: string; versionId?: string }
  ) =>
    api.post<OscratAssessmentSummary[]>(
      `/teams/${teamSlug}/assessments/find`,
      filters || {}
    ),

  createAssessment: (
    teamSlug: string,
    data: OscratAssessmentCreateRequest
  ) =>
    api.post<OscratAssessmentDetail>(
      `/teams/${teamSlug}/assessments`,
      data
    ),

  getAssessmentDetail: (teamSlug: string, assessmentId: string) =>
    api.get<OscratAssessmentDetail>(
      `/teams/${teamSlug}/assessments/${assessmentId}`
    ),

  updateAssessment: (
    teamSlug: string,
    assessmentId: string,
    data: { schemaVersion?: string; rawData?: Record<string, any> }
  ) =>
    api.put<OscratAssessmentDetail>(
      `/teams/${teamSlug}/assessments/${assessmentId}`,
      data
    ),

  deleteAssessment: (teamSlug: string, assessmentId: string) =>
    api.delete<void>(`/teams/${teamSlug}/assessments/${assessmentId}`),
};
