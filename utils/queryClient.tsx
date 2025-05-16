import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/hooks';

export function ReactQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
