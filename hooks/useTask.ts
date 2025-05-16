import { useGetTask, useUpdateTask, useDeleteTask } from '@/lib/api/hooks';
import type { UpdateTaskData } from '@/lib/api/endpoints/tasks';

/**
 * Hook to fetch and manage a single task
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useTask(slug: string, taskNumber: string) {
  const {
    data: task,
    isLoading: isFetching,
    isError,
    error,
  } = useGetTask(slug, taskNumber);

  const updateMutation = useUpdateTask(slug, taskNumber);
  const deleteMutation = useDeleteTask(slug, taskNumber);

  const updateTask = async (data: UpdateTaskData) => {
    return updateMutation.mutateAsync(data);
  };

  const deleteTask = async () => {
    return deleteMutation.mutateAsync();
  };

  const isLoading =
    isFetching || updateMutation.isPending || deleteMutation.isPending;

  return {
    task,
    isLoading,
    isError,
    error,
    updateTask,
    deleteTask,
  };
}
