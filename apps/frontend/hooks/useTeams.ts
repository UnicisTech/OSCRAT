import { useGetTeams, useCreateTeam } from '@/lib/api/hooks/teams';
import {
  useGetCscIso,
  useSetCscIso,
  useUpdateCscStatus,
} from '@/lib/api/hooks/csc';
import type { ISO } from '@/types';
import type { UpdateCscStatusData } from '@/lib/api/endpoints/csc';
import type { TeamCreateRequest } from '@oscrat/model';

/**
 * Hook to fetch and manage teams list
 */
export function useTeams() {
  const { data, isLoading: isFetching, isError, error } = useGetTeams();
  const createMutation = useCreateTeam();

  const teams = data || [];

  const createTeam = async (data: TeamCreateRequest) => {
    return createMutation.mutateAsync(data);
  };

  const isLoading = isFetching || createMutation.isPending;

  return {
    teams,
    isLoading,
    isError,
    error,
    createTeam,
  };
}

/**
 * Hook to fetch and manage team CSC data
 */
export function useTeamCsc(slug: string) {
  const {
    data: iso,
    isLoading: isIsoLoading,
    isError: isIsoError,
    error: isoError,
  } = useGetCscIso(slug);

  const setIsoMutation = useSetCscIso(slug);
  const updateStatusMutation = useUpdateCscStatus(slug);

  const setIso = async (iso: ISO) => {
    return setIsoMutation.mutateAsync(iso);
  };

  const updateStatus = async (data: UpdateCscStatusData) => {
    return updateStatusMutation.mutateAsync(data);
  };

  const isLoading =
    isIsoLoading || setIsoMutation.isPending || updateStatusMutation.isPending;

  return {
    isoData: iso,
    isLoading,
    isIsoError,
    isoError,
    setIso,
    updateStatus,
  };
}
