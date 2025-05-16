/**
 * Hook to fetch all tasks for a specific team.
 * @param slug Team slug
 */

import { useGetTeamTasks } from '@/lib/api/hooks';

export default function useTasks(slug: string) {
  const { data: tasks, isLoading, isError, error } = useGetTeamTasks(slug);

  return {
    tasks,
    isLoading,
    isError,
    error,
  };
}
