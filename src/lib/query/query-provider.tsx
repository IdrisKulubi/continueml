"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query configuration with caching strategies
 * Implements stale-while-revalidate pattern for optimal UX
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale-while-revalidate: show cached data immediately, refetch in background
            staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for this duration
            gcTime: 1000 * 60 * 30, // 30 minutes - cache garbage collection time (formerly cacheTime)
            
            // Refetch strategies
            refetchOnWindowFocus: true, // Refetch when user returns to tab
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: true, // Refetch when component mounts
            
            // Retry configuration
            retry: 2, // Retry failed requests twice
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            
            // Network mode
            networkMode: "online", // Only fetch when online
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
            retryDelay: 1000,
            networkMode: "online",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

