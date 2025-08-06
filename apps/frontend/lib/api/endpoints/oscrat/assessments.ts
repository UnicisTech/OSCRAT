import { api } from '@/lib/api/client';
import {
  OscratAssessmentSummary,
  OscratAssessmentDetail,
  OscratAssessmentCreate,
} from '@oscrat/model';

export const oscratAssessmentEndpoints = {
  listAssessments: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratAssessmentSummary[]>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}/assessments`
    ),

  createAssessment: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratAssessmentCreate
  ) =>
    api.post<OscratAssessmentDetail>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}/assessments`,
      data
    ),

  getAssessmentDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    assessmentId: string
  ) =>
    api.get<OscratAssessmentDetail>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}/assessments/${assessmentId}`
    ),

  deleteAssessment: (
    teamId: string,
    productId: string,
    versionId: string,
    assessmentId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/oscrat/projects/${productId}/versions/${versionId}/assessments/${assessmentId}`
    ),
};
