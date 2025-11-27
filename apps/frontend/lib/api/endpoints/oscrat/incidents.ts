import { api } from '@/lib/api/client';
import {
  OscratIncidentDetail,
  OscratIncidentSummary,
  OscratIncidentCreate,
  OscratIncidentUpdate,
} from '@oscrat/model';

export const oscratIncidentEndpoints = {
  listIncidents: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratIncidentSummary[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/incidents`
    ),

  getIncidentDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    incidentId: string
  ) =>
    api.get<OscratIncidentDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/incidents/${incidentId}`
    ),

  createIncident: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratIncidentCreate
  ) =>
    api.post<OscratIncidentDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/incidents`,
      data
    ),

  updateIncident: (
    teamId: string,
    productId: string,
    versionId: string,
    incidentId: string,
    data: OscratIncidentUpdate
  ) =>
    api.put<OscratIncidentDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/incidents/${incidentId}`,
      data
    ),

  deleteIncident: (
    teamId: string,
    productId: string,
    versionId: string,
    incidentId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/incidents/${incidentId}`
    ),
};
