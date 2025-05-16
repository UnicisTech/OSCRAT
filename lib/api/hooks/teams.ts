import { useQuery, useMutation } from '@tanstack/react-query';
import { teamsEndpoints } from '@/lib/api/endpoints/teams';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';
import type { UpdateTeamData } from '@/lib/api/endpoints/teams';
import type { TeamProperties } from '@/types';

// Team list
export function useGetTeams() {
  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => teamsEndpoints.list(),
  });
}

// Single team
export function useGetTeam(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(slug),
    queryFn: () => teamsEndpoints.getTeam(slug),
  });
}

export function useCreateTeam() {
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      teamsEndpoints.create(name, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useUpdateTeam(slug: string) {
  return useMutation({
    mutationFn: (data: UpdateTeamData) => teamsEndpoints.updateTeam(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

export function useDeleteTeam(slug: string) {
  return useMutation({
    mutationFn: () => teamsEndpoints.deleteTeam(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
}

// Team members
export function useGetTeamMembers(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.members(slug),
    queryFn: () => teamsEndpoints.getMembers(slug),
  });
}

export function useAddTeamMember(slug: string) {
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      teamsEndpoints.addMember(slug, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(slug),
      });
    },
  });
}

export function useUpdateTeamMember(slug: string) {
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      teamsEndpoints.updateMember(slug, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(slug),
      });
    },
  });
}

export function useDeleteTeamMember(slug: string) {
  return useMutation({
    mutationFn: (userId: string) => teamsEndpoints.removeMember(slug, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(slug),
      });
    },
  });
}

// Team properties
export function useUpdateTeamProperties(slug: string) {
  return useMutation({
    mutationFn: (properties: Partial<TeamProperties>) =>
      teamsEndpoints.updateTeamProperties(slug, properties),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(slug) });
    },
  });
}

// Team permissions
export function useGetTeamPermissions(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.permissions(slug),
    queryFn: () => teamsEndpoints.getPermissions(slug),
  });
}

export function useLeaveTeam(slug: string, id: string) {
  return useMutation({
    mutationFn: () => teamsEndpoints.removeMember(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(slug),
      });
    },
  });
}
