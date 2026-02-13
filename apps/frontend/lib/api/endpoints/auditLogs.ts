import { api } from '@/lib/api/client';
import type {
  OscratPaginatedAuditLogs,
  OscratAuditLogQueryParams,
  AuditLogFilterOptions,
} from '@oscrat/model';

export const auditLogEndpoints = {
  searchAuditLogs: (teamSlug: string, params: OscratAuditLogQueryParams = {}) =>
    api.post<OscratPaginatedAuditLogs>(`/teams/${teamSlug}/audit-logs`, params),

  getFilterOptions: (teamSlug: string) =>
    api.get<AuditLogFilterOptions>(`/teams/${teamSlug}/audit-logs/filter-options`),
};
