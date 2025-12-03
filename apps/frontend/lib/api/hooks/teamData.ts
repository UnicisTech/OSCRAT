import { useMutation, useQuery } from '@tanstack/react-query';
import {
  teamDataEndpoints,
  TeamDataUpsertRequest,
  TeamDataUpdateRequest,
} from '@/lib/api/endpoints/teamData';
import { queryKeys } from '../queryKeys';
import { queryClient } from '.';

export function useGetTeamDataList(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.data.all(slug),
    queryFn: () => teamDataEndpoints.list(slug),
  });
}

export function useGetTeamData(slug: string, dataKey: string) {
  return useQuery({
    queryKey: queryKeys.teams.data.detail(slug, dataKey),
    queryFn: () => teamDataEndpoints.get(slug, dataKey),
    enabled: !!dataKey,
  });
}

export function useUpsertTeamData(slug: string) {
  return useMutation({
    mutationFn: (data: TeamDataUpsertRequest) =>
      teamDataEndpoints.upsert(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.all(slug),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.detail(slug, variables.dataKey),
      });
    },
  });
}

export function useUpdateTeamData(slug: string, dataKey: string) {
  return useMutation({
    mutationFn: (data: TeamDataUpdateRequest) =>
      teamDataEndpoints.update(slug, dataKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.detail(slug, dataKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.all(slug),
      });
    },
  });
}

export function useDeleteTeamData(slug: string, dataKey: string) {
  return useMutation({
    mutationFn: () => teamDataEndpoints.delete(slug, dataKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.detail(slug, dataKey),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.data.all(slug),
      });
    },
  });
}
