"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorldsAction, getWorldByIdAction } from "@/app/actions/worlds";

/**
 * Query keys for worlds
 * Organized hierarchically for efficient cache invalidation
 */
export const worldKeys = {
  all: ["worlds"] as const,
  lists: () => [...worldKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...worldKeys.lists(), filters] as const,
  details: () => [...worldKeys.all, "detail"] as const,
  detail: (id: string) => [...worldKeys.details(), id] as const,
  stats: (id: string) => [...worldKeys.detail(id), "stats"] as const,
};

/**
 * Hook to fetch all worlds with caching
 * Uses stale-while-revalidate pattern
 */
export function useWorlds() {
  return useQuery({
    queryKey: worldKeys.lists(),
    queryFn: async () => {
      const result = await getWorldsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch a single world by ID with caching
 */
export function useWorld(worldId: string) {
  return useQuery({
    queryKey: worldKeys.detail(worldId),
    queryFn: async () => {
      const result = await getWorldByIdAction(worldId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!worldId, // Only fetch if worldId is provided
  });
}

/**
 * Hook to prefetch worlds for faster navigation
 * Call this when user hovers over a link
 */
export function usePrefetchWorld() {
  const queryClient = useQueryClient();

  return (worldId: string) => {
    queryClient.prefetchQuery({
      queryKey: worldKeys.detail(worldId),
      queryFn: async () => {
        const result = await getWorldByIdAction(worldId);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Hook to invalidate world cache
 * Use after mutations to refresh data
 */
export function useInvalidateWorlds() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: worldKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: worldKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: worldKeys.detail(id) }),
  };
}

