"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading fallback for lazy-loaded components
 * Shows a skeleton while the component is loading
 */
function LoadingFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Lazy load a component with automatic code splitting
 * Wraps the component in Suspense with a loading fallback
 * 
 * @param importFn - Dynamic import function
 * @param fallback - Optional custom loading fallback
 * @returns Lazy-loaded component
 */
type DynamicImport<TProps extends Record<string, unknown>> = () => Promise<{
  default: ComponentType<TProps>;
}>;

export function lazyLoad<TProps extends Record<string, unknown> = Record<string, never>>(
  importFn: DynamicImport<TProps>,
  fallback?: ReactNode
) {
  return dynamic<TProps>(importFn, {
    loading: () => <>{fallback ?? <LoadingFallback />}</>,
    ssr: false, // Disable SSR for dialogs and modals
  });
}

/**
 * Lazy load a dialog component
 * Optimized for dialog/modal components that don't need SSR
 */
export function lazyLoadDialog<
  TProps extends Record<string, unknown> = Record<string, never>
>(importFn: DynamicImport<TProps>) {
  return dynamic<TProps>(importFn, {
    loading: () => null, // No loading state for dialogs (they're hidden initially)
    ssr: false,
  });
}

/**
 * Lazy load a heavy component with custom loading state
 * Use for components that take time to load (charts, editors, etc.)
 */
export function lazyLoadHeavy<
  TProps extends Record<string, unknown> = Record<string, never>
>(
  importFn: DynamicImport<TProps>,
  loadingMessage = "Loading..."
) {
  return dynamic<TProps>(importFn, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for heavy components too when lazy loaded
  });
}

