import { api } from '@/lib/api/client';
import { ComplianceArea } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';

export const complianceEndpoints = {
  getData: (teamSlug: string, params: { role: OscratOrganizationRole }) =>
    api.get<ComplianceArea[]>(`/teams/${teamSlug}/compliance/data`, { params }),
};

export const teamComplianceEndpoints = {
  getData: (teamSlug: string, params: { role: OscratOrganizationRole }) =>
    api.get<ComplianceArea[]>(`/teams/${teamSlug}/team-compliance/data`, {
      params,
    }),
};
