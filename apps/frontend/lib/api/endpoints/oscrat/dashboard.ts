import { api } from '@/lib/api/client';
import type { TeamDashboardSummary } from '@oscrat/model';

export const oscratDashboardEndpoints = {
  getDashboardSummary: (teamId: string) =>
    api.get<TeamDashboardSummary>(`/teams/${teamId}/dashboard/summary`),
};
