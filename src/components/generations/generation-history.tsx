"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import type { Generation } from "@/types";
import GenerationCard from "./generation-card";

interface GenerationHistoryProps {
  generations: Generation[];
  worldId: string;
  currentPage: number;
  hasMore: boolean;
}

export default function GenerationHistory({
  generations,
  worldId,
  currentPage,
  hasMore,
}: GenerationHistoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/worlds/${worldId}/history?${params.toString()}`);
  };

  if (generations.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>No generations yet</EmptyTitle>
          <EmptyDescription>
            Start generating content to see your history here
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => router.push(`/worlds/${worldId}/generate`)}>
            Create Generation
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {generations.length} generation{generations.length !== 1 ? "s" : ""}
          {currentPage > 1 && ` (Page ${currentPage})`}
        </p>
      </div>

      {/* Generation Timeline */}
      <div className="space-y-4">
        {generations.map((generation) => (
          <GenerationCard
            key={generation.id}
            generation={generation}
            worldId={worldId}
          />
        ))}
      </div>

      {/* Pagination */}
      {(currentPage > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!hasMore}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
