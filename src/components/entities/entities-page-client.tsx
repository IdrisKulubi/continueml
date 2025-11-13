"use client";

import { useEffect } from "react";
import { useBranchStore } from "@/lib/stores/branch-store";
import { useRouter } from "next/navigation";

interface EntitiesPageClientProps {
  worldId: string;
  children: React.ReactNode;
}

/**
 * Client wrapper for entities page that handles branch context
 * Refreshes the page when branch changes to reload entities
 */
export function EntitiesPageClient({  children }: EntitiesPageClientProps) {
  const router = useRouter();
  const { currentBranch } = useBranchStore();

  // Refresh when branch changes
  useEffect(() => {
    router.refresh();
  }, [currentBranch?.id, router]);

  return <>{children}</>;
}
