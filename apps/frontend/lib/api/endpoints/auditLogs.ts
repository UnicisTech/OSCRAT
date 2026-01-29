import { api } from '@/lib/api/client';
import type { OscratPaginatedAuditLogs, OscratAuditLogQueryParams } from '@oscrat/model';

export const auditLogEndpoints = {
  searchAuditLogs: (teamSlug: string, params: OscratAuditLogQueryParams = {}) =>
    api.post<OscratPaginatedAuditLogs>(`/teams/${teamSlug}/audit-logs`, params),
};
