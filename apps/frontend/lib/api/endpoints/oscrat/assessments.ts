import { api } from '@/lib/api/client';
import {
  OscratAssessmentSummary,
  OscratAssessmentDetail,
  OscratAssessmentCreate,
} from '@oscrat/model';

export const oscratAssessmentEndpoints = {
  listAssessments: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratAssessmentSummary[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/assessments`
    ),

  createAssessment: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratAssessmentCreate
  ) =>
    api.post<OscratAssessmentDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/assessments`,
      data
    ),

  getAssessmentDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    assessmentId: string
  ) =>
    api.get<OscratAssessmentDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/assessments/${assessmentId}`
    ),

  deleteAssessment: (
    teamId: string,
    productId: string,
    versionId: string,
    assessmentId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/assessments/${assessmentId}`
    ),

  listProductAssessments: (slug: string, productId: string) =>
    api.get<OscratAssessmentSummary[]>(
      `/teams/${slug}/products/${productId}/assessments`
    ),

  getProductAssessmentDetail: (
    slug: string,
    productId: string,
    assessmentId: string
  ) =>
    api.get<OscratAssessmentDetail>(
      `/teams/${slug}/products/${productId}/assessments/${assessmentId}`
    ),
};
