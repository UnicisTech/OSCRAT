import { useQuery, useMutation } from '@tanstack/react-query';
import { cscEndpoints } from '@/lib/api/endpoints/csc';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { ISO } from '@/types';
import type {
  UpdateCscStatusData,
  UpdateTaskCscData,
} from '@/lib/api/endpoints/csc';

export function useGetCscIso(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.csc.iso(slug),
    queryFn: () => cscEndpoints.getCscIso(slug),
    enabled: !!slug,
  });
}

export function useSetCscIso(slug: string) {
  return useMutation({
    mutationFn: (iso: ISO) => cscEndpoints.setCscIso(slug, iso),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.csc.iso(slug),
      });
    },
  });
}

export function useUpdateCscStatus(slug: string) {
  return useMutation({
    mutationFn: (data: UpdateCscStatusData) =>
      cscEndpoints.updateCscStatus(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.csc.statuses(slug),
      });
    },
  });
}

export function useUpdateTaskCsc(slug: string, taskNumber: number) {
  return useMutation({
    mutationFn: (data: UpdateTaskCscData) =>
      cscEndpoints.updateTaskCsc(slug, taskNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
    },
  });
}
