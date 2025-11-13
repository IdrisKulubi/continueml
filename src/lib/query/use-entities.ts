"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEntitiesAction, getEntityByIdAction } from "@/app/actions/entities";
import type {  EntityFilters } from "@/types";

/**
 * Query keys for entities
 * Organized hierarchically for efficient cache invalidation
 */
export const entityKeys = {
  all: ["entities"] as const,
  lists: () => [...entityKeys.all, "list"] as const,
  list: (worldId: string, filters?: EntityFilters) =>
    [...entityKeys.lists(), worldId, filters] as const,
  details: () => [...entityKeys.all, "detail"] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
};

/**
 * Hook to fetch entities for a world with caching
 * Supports filtering and search
 */
export function useEntities(worldId: string, filters?: EntityFilters) {
  return useQuery({
    queryKey: entityKeys.list(worldId, filters),
    queryFn: async () => {
      const result = await getEntitiesAction(worldId, filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes (entities change more frequently)
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!worldId,
  });
}

/**
 * Hook to fetch a single entity by ID with caching
 */
export function useEntity(entityId: string) {
  return useQuery({
    queryKey: entityKeys.detail(entityId),
    queryFn: async () => {
      const result = await getEntityByIdAction(entityId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!entityId,
  });
}

/**
 * Hook to prefetch entities for faster navigation
 */
export function usePrefetchEntity() {
  const queryClient = useQueryClient();

  return (entityId: string) => {
    queryClient.prefetchQuery({
      queryKey: entityKeys.detail(entityId),
      queryFn: async () => {
        const result = await getEntityByIdAction(entityId);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
      staleTime: 1000 * 60 * 3,
    });
  };
}

/**
 * Hook to invalidate entity cache
 */
export function useInvalidateEntities() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: entityKeys.all }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    invalidateList: (worldId: string) =>
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) }),
  };
}

