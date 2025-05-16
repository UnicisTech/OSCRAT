import { useQuery, useMutation } from '@tanstack/react-query';
import { directoryEndpoints } from '@/lib/api/endpoints/teams/directory';
import { queryKeys } from '@/lib/api/queryKeys';
import { queryClient } from '@/lib/api/hooks';

export function useGetDirectories(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.directory(slug),
    queryFn: () => directoryEndpoints.getDirectories(slug),
  });
}

export function useCreateDirectory(slug: string) {
  return useMutation({
    mutationFn: (data: {
      name: string;
      provider: string;
      settings: Record<string, string>;
    }) => directoryEndpoints.createDirectory(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.directory(slug),
      });
    },
  });
}

export function useUpdateDirectory(slug: string) {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        provider?: string;
        settings?: Record<string, string>;
      };
    }) => directoryEndpoints.updateDirectory(slug, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.directory(slug),
      });
    },
  });
}

export function useDeleteDirectory(slug: string) {
  return useMutation({
    mutationFn: (id: string) => directoryEndpoints.deleteDirectory(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.directory(slug),
      });
    },
  });
}

export function useSyncDirectory(slug: string) {
  return useMutation({
    mutationFn: (id: string) => directoryEndpoints.syncDirectory(slug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.directory(slug),
      });
    },
  });
}
