import { QueryClient } from '@tanstack/react-query';

// Create a shared query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    },
    mutations: {
      retry: false,
    },
  },
});

// Export all hooks
export * from './auth';
export * from './users';
export * from './teams';
export * from './invitations';
export * from './oauth';
export * from './health';
export * from './password';
export * from './tasks';
export * from './webhooks';
export * from './comments';
export * from './compliance';
