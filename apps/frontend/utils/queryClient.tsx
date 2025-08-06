import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/hooks';
import { ReactNode } from 'react';

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
