import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';

import { useTask } from '@/hooks/useTask';
import { Loading } from '@/components/shared';

type UseTaskContext = ReturnType<typeof useTask>;

interface TaskContextType {
  taskContext: UseTaskContext;
  slug: string;
  taskNumber: string;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskContextProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const teamSlug = router.query.slug as string;
  const taskNumber = router.query.taskNumber as string;

  const taskContext = useTask(teamSlug, taskNumber);
  const isLoading = taskContext.isLoading;

  useEffect(() => {
    if (!isLoading && taskContext.error) {
      router.push('/404');
    }
  }, [isLoading, taskContext.error, router]);

  const contextValue = useMemo<TaskContextType>(
    () => ({
      slug: teamSlug,
      taskNumber,
      taskContext,
    }),
    [teamSlug, taskContext]
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskContextProvider');
  }
  return context;
};
