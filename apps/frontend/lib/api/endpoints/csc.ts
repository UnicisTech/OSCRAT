import { ISO } from '@/types';
import { api } from '@/lib/api/client';

export type UpdateCscStatusData = {
  control: string;
  value: string;
};

export type UpdateTaskCscData = {
  controls: string[];
  operation: 'add' | 'remove' | 'change';
  iso: ISO | undefined;
};

export const cscEndpoints = {
  getCscIso: (slug: string) => {
    return api.get<ISO>(`/teams/${slug}/csc/iso`);
  },

  setCscIso: (slug: string, iso: ISO) =>
    api.put<ISO>(`/teams/${slug}/csc/iso`, { iso }),

  updateCscStatus: (slug: string, data: UpdateCscStatusData) =>
    api.put<{ statuses: Record<string, string> }>(`/teams/${slug}/csc`, data),

  updateTaskCsc: (slug: string, taskNumber: number, data: UpdateTaskCscData) =>
    api.put<{ success: boolean }>(
      `/teams/${slug}/tasks/${taskNumber}/csc`,
      data
    ),
};
