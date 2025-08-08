import {
  useGetTeam,
  useUpdateTeam,
  useDeleteTeam,
  useLeaveTeam,
} from '@/lib/api/hooks/teams';
import {
  useGetCscIso,
  useSetCscIso,
  useUpdateCscStatus,
} from '@/lib/api/hooks/csc';
import type { TeamSettingsUpdate } from '@oscrat/model';
import type { ISO } from '@/types';
import type {
  UpdateCscStatusData,
  UpdateTaskCscData,
} from '@/lib/api/endpoints/csc';
import { queryClient } from '@/lib/api/hooks';
import { cscEndpoints } from '@/lib/api/endpoints/csc';
import { useSession } from 'next-auth/react';

/**
 * Hook to fetch and manage team data
 * @param slug Team slug to use for data fetching and operations
 */
export function useTeam(slug: string) {
  const { data: session } = useSession();

  const {
    data: team,
    isLoading: isFetching,
    isError,
    error,
  } = useGetTeam(slug);


  // Team mutations
  const updateMutation = useUpdateTeam(slug);
  const deleteMutation = useDeleteTeam(slug);
  const leaveMutation = useLeaveTeam(slug, session?.user.id as string);

  // CSC related queries and mutations
  const {
    data: cscIsoData,
    isLoading: isCscIsoLoading,
    isError: isCscIsoError,
    error: cscIsoError,
  } = useGetCscIso(slug);

  const setIsoMutation = useSetCscIso(slug);
  const updateCscStatusMutation = useUpdateCscStatus(slug);

  // Team actions
  const updateTeam = async (data: TeamSettingsUpdate) => {
    return updateMutation.mutateAsync(data);
  };

  const deleteTeam = async () => {
    return deleteMutation.mutateAsync();
  };

  const leaveTeam = async () => {
    return leaveMutation.mutateAsync();
  };

  const setCscIso = async (iso: ISO) => {
    return setIsoMutation.mutateAsync(iso);
  };

  const updateCscStatus = async (data: UpdateCscStatusData) => {
    return updateCscStatusMutation.mutateAsync(data);
  };

  const updateTaskCsc = async (taskNumber: number, data: UpdateTaskCscData) => {
    const result = await cscEndpoints.updateTaskCsc(slug, taskNumber, data);
    queryClient.invalidateQueries({
      queryKey: ['teams', 'tasks', 'all', slug],
    });
    return result;
  };

  const isLoading =
    isFetching ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    leaveMutation.isPending ||
    isCscIsoLoading ||
    setIsoMutation.isPending ||
    updateCscStatusMutation.isPending;

  return {
    team,
    isLoading,
    isError,
    error,
    updateTeam,
    deleteTeam,
    leaveTeam,
    // CSC related data and actions
    cscIso: cscIsoData,
    isCscIsoError,
    cscIsoError,
    setCscIso,
    updateCscStatus,
    updateTaskCsc,
  };
}
