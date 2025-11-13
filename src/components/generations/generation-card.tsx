"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { MoreVertical, RefreshCw, Trash2, ExternalLink, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types";
import { retryGenerationAction, deleteGenerationAction } from "@/app/actions/generations";
import ConsistencyBadge from "./consistency-badge";

interface GenerationCardProps {
  generation: Generation;
  worldId: string;
}

const TOOL_LABELS: Record<string, string> = {
  runway: "Runway",
  midjourney: "Midjourney",
  stable_diffusion: "Stable Diffusion",
  other: "Other",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  queued: {
    label: "Queued",
    variant: "secondary",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  processing: {
    label: "Processing",
    variant: "default",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  completed: {
    label: "Completed",
    variant: "outline",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
  },
};

export default function GenerationCard({ generation, worldId }: GenerationCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const statusConfig = STATUS_CONFIG[generation.status] || STATUS_CONFIG.queued;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await retryGenerationAction(generation.id);
      if (result.success) {
        toast.success("Generation retry initiated");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to retry generation");
      }
    } catch (error) {
      console.error("Error retrying generation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGenerationAction(generation.id);
      if (result.success) {
        toast.success("Generation deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete generation");
      }
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusConfig.variant} className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline">{TOOL_LABELS[generation.tool]}</Badge>
                {generation.consistencyScore !== null && (
                  <ConsistencyBadge score={generation.consistencyScore} />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>{formatDate(generation.createdAt)}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Generation actions">
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {generation.consistencyScore !== null && generation.resultUrl && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/worlds/${worldId}/history/${generation.id}`)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                    View Analysis
                  </DropdownMenuItem>
                )}
                {generation.status === "failed" && (
                  <DropdownMenuItem onClick={handleRetry} disabled={isRetrying}>
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                    Retry
                  </DropdownMenuItem>
                )}
                {generation.resultUrl && (
                  <DropdownMenuItem asChild>
                    <a href={generation.resultUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                      View Result
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Result Thumbnail */}
          {generation.resultUrl && generation.status === "completed" && (
            <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
              <img
                src={generation.resultUrl}
                alt={`Generated content from prompt: ${generation.originalPrompt.slice(0, 100)}${generation.originalPrompt.length > 100 ? '...' : ''}`}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Prompts */}
          <div className="space-y-3">
            {/* Original Prompt */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Original Prompt</h4>
                <Badge variant="outline" className="text-xs">
                  {generation.originalPrompt.length} chars
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {generation.originalPrompt}
              </p>
            </div>

            {/* Enhanced Prompt (if different) */}
            {generation.enhancedPrompt !== generation.originalPrompt && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                    <h4 className="text-sm font-medium">Enhanced Prompt</h4>
                    <Badge variant="outline" className="text-xs">
                      {generation.enhancedPrompt.length} chars
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {generation.enhancedPrompt}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {generation.status === "failed" && generation.errorMessage && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{generation.errorMessage}</p>
            </div>
          )}

          {/* Entity Count */}
          {generation.entityIds.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Used {generation.entityIds.length} {generation.entityIds.length === 1 ? "entity" : "entities"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this generation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
