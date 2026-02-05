'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * TanStack Query Provider Component
 * Wraps the app to enable React Query functionality
 * 
 * This provider gives you:
 * - Automatic caching of API responses
 * - Background refetching to keep data fresh
 * - Loading and error states
 * - Optimistic updates
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance
  // We use useState to ensure the client is created only once per component mount
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache responses for 5 minutes
            staleTime: 1000 * 60 * 5,
            
            // Keep unused data in cache for 10 minutes
            gcTime: 1000 * 60 * 10,
            
            // Retry failed requests 1 time
            retry: 1,
            
            // Refetch on window focus (keeps data fresh)
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry failed mutations 0 times (don't retry writes)
            retry: 0,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
