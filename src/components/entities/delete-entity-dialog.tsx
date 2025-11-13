"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Entity } from "@/types";
import { deleteEntityAction } from "@/app/actions/entities";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteEntityDialogProps {
  entity: Entity;
  worldId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEntityDialog({
  entity,
  open,
  onOpenChange,
}: DeleteEntityDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteEntityAction(entity.id);

      if (result.success) {
        toast.success("Entity deleted successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete entity");
      }
    } catch (error) {
      console.error("Error deleting entity:", error);
      toast.error("Failed to delete entity");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Entity</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete <strong>{entity.name}</strong>? This action cannot be
            undone.
            <br />
            <br />
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Warning: All images and embeddings associated with this entity will be permanently
              deleted. Any generations referencing this entity will lose the connection.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Entity"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
