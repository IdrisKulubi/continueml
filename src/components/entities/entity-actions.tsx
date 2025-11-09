"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Archive, Trash2 } from "lucide-react";
import { Entity } from "@/types";
import { DeleteEntityDialog } from "./delete-entity-dialog";
import { duplicateEntityAction } from "@/app/actions/entities";
import { toast } from "sonner";

interface EntityActionsProps {
  entity: Entity;
  worldId: string;
}

export function EntityActions({ entity, worldId }: EntityActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    try {
      const result = await duplicateEntityAction(entity.id);

      if (result.success) {
        toast.success("Entity duplicated successfully (including images)");
        router.push(`/worlds/${worldId}/entities/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to duplicate entity");
      }
    } catch (error) {
      console.error("Error duplicating entity:", error);
      toast.error("Failed to duplicate entity");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleArchive = () => {
    // Navigate to edit page with archive intent
    router.push(`/worlds/${worldId}/entities/${entity.id}/edit?archive=true`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="mr-2 h-4 w-4" />
            <span>{isDuplicating ? "Duplicating..." : "Duplicate"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            <span>{entity.isArchived ? "Unarchive" : "Archive"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteEntityDialog
        entity={entity}
        worldId={worldId}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
