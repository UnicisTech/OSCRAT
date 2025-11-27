import { api } from '@/lib/api/client';
import {
  OscratVulnerabilityDetail,
  OscratVulnerabilitySummary,
  OscratVulnerabilityCreate,
  OscratVulnerabilityUpdate,
} from '@oscrat/model';

export const oscratVulnerabilityEndpoints = {
  listVulnerabilities: (teamId: string, productId: string, versionId: string) =>
    api.get<OscratVulnerabilitySummary[]>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerabilities`
    ),

  getVulnerabilityDetail: (
    teamId: string,
    productId: string,
    versionId: string,
    vulnerabilityId: string
  ) =>
    api.get<OscratVulnerabilityDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`
    ),

  createVulnerability: (
    teamId: string,
    productId: string,
    versionId: string,
    data: OscratVulnerabilityCreate
  ) =>
    api.post<OscratVulnerabilityDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerabilities`,
      data
    ),

  updateVulnerability: (
    teamId: string,
    productId: string,
    versionId: string,
    vulnerabilityId: string,
    data: OscratVulnerabilityUpdate
  ) =>
    api.put<OscratVulnerabilityDetail>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`,
      data
    ),

  deleteVulnerability: (
    teamId: string,
    productId: string,
    versionId: string,
    vulnerabilityId: string
  ) =>
    api.delete<void>(
      `/teams/${teamId}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`
    ),
};
