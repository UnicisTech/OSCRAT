import { useGetTeamTasks, useCreateTeamTask } from '@/lib/api/hooks';
import type { CreateTaskData } from '@/lib/api/endpoints/tasks';

/**
 * Hook to fetch and manage tasks for a specific team
 * @param slug Team slug
 */
export default function useTasks(slug: string) {
  const {
    data: tasks,
    isLoading: isFetchingTasks,
    isError,
    error,
  } = useGetTeamTasks(slug);

  const createTaskMutation = useCreateTeamTask(slug);

  const createTask = async (data: CreateTaskData) => {
    return createTaskMutation.mutateAsync(data);
  };

  const isLoading = isFetchingTasks || createTaskMutation.isPending;

  return {
    tasks,
    isLoading,
    isError,
    error,
    createTask,
  };
}
