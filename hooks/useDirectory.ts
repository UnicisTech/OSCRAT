import {
  useGetDirectories,
  useCreateDirectory,
  useUpdateDirectory,
  useDeleteDirectory,
  useSyncDirectory,
} from '@/lib/api/hooks/directory';

type DirectoryData = {
  name: string;
  provider: string;
  settings: Record<string, string>;
};

type UpdateDirectoryData = {
  name?: string;
  provider?: string;
  settings?: Record<string, string>;
};

/**
 * Hook to fetch and manage team directory sync
 * @param slug Team slug
 */
export function useDirectory(slug: string) {
  const {
    data: directories,
    isLoading: isFetching,
    isError,
    error,
  } = useGetDirectories(slug);

  const createMutation = useCreateDirectory(slug);
  const updateMutation = useUpdateDirectory(slug);
  const deleteMutation = useDeleteDirectory(slug);
  const syncMutation = useSyncDirectory(slug);

  const createDirectory = async (data: DirectoryData) => {
    return createMutation.mutateAsync(data);
  };

  const updateDirectory = async (id: string, data: UpdateDirectoryData) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteDirectory = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const syncDirectory = async (id: string) => {
    return syncMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    syncMutation.isPending;

  return {
    directories,
    isLoading,
    isError,
    error,
    createDirectory,
    updateDirectory,
    deleteDirectory,
    syncDirectory,
  };
}
