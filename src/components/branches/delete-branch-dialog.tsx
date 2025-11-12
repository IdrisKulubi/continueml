"use client";

import { useTransition } from "react";
import { Branch } from "@/types";
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
import { Loader2 } from "lucide-react";
import { deleteBranchAction } from "@/app/actions/branches";
import { useBranchStore } from "@/lib/stores/branch-store";
import { toast } from "sonner";

interface DeleteBranchDialogProps {
  branch: Branch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBranchDialog({
  branch,
  open,
  onOpenChange,
}: DeleteBranchDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { removeBranch, currentBranch, setCurrentBranch } = useBranchStore();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBranchAction(branch.id);

      if (result.success) {
        // Remove from store
        removeBranch(branch.id);

        // If this was the current branch, switch to main
        if (currentBranch?.id === branch.id) {
          setCurrentBranch(null);
        }

        toast.success(`Successfully deleted branch "${branch.name}"`);

        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete branch");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
            Delete Branch "{branch.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the branch
            and all its entities, generations, and embeddings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="border-gray-300 dark:border-gray-600"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Branch"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
