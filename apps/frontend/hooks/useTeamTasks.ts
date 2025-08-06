import { useGetTeamTasks, useCreateTeamTask } from '@/lib/api/hooks';
import type { CreateTaskData } from '@/lib/api/endpoints/tasks';

/**
 * Hook to fetch and manage team tasks
 * @param slug Team slug
 */
export function useTeamTasks(slug: string) {
  const {
    data: tasks,
    isLoading: isFetching,
    isError,
    error,
  } = useGetTeamTasks(slug);

  const createMutation = useCreateTeamTask(slug);

  const createTask = async (data: CreateTaskData) => {
    return createMutation.mutateAsync(data);
  };

  const isLoading = isFetching || createMutation.isPending;

  return {
    tasks,
    isLoading,
    isError,
    error,
    createTask,
  };
}
