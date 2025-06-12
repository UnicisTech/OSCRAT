import { api } from '@/lib/api/client';
import {
  OscratAssessmentSummary,
  OscratAssessmentDetail,
  OscratAssessmentCreate,
} from '@/types/oscrat/assessment';

export const oscratAssessmentEndpoints = {
  listAssessments: (teamId: string, projectId: string) =>
    api.get<OscratAssessmentSummary[]>(
      `/teams/${teamId}/oscrat/projects/${projectId}/assessments`
    ),

  createAssessment: (
    teamId: string,
    projectId: string,
    data: OscratAssessmentCreate
  ) =>
    api.post<OscratAssessmentDetail>(
      `/teams/${teamId}/oscrat/projects/${projectId}/assessments`,
      data
    ),

  getAssessmentDetail: (
    teamId: string,
    projectId: string,
    assessmentId: string
  ) =>
    api.get<OscratAssessmentDetail>(
      `/teams/${teamId}/oscrat/projects/${projectId}/assessments/${assessmentId}`
    ),

  deleteAssessment: (teamId: string, projectId: string, assessmentId: string) =>
    api.delete<void>(
      `/teams/${teamId}/oscrat/projects/${projectId}/assessments/${assessmentId}`
    ),
};
