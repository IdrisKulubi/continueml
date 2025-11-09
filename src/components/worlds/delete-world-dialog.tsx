"use client";

import { useTransition } from "react";
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
import { toast } from "sonner";
import { deleteWorldAction } from "@/app/actions/worlds";
import { World } from "@/types";
import { AlertTriangle } from "lucide-react";

interface DeleteWorldDialogProps {
  world: World;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorldDialog({ world, open, onOpenChange }: DeleteWorldDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWorldAction(world.id);

      if (result.success) {
        toast.success("World deleted successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px] rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Delete World</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 text-base">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{world.name}</span>?
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 space-y-3">
              <p className="text-red-800 dark:text-red-400 font-semibold text-sm">
                ⚠️ This action cannot be undone. This will permanently delete:
              </p>
              <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-500 mt-0.5">•</span>
                  <span>All entities in this world</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-500 mt-0.5">•</span>
                  <span>All entity images and embeddings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-500 mt-0.5">•</span>
                  <span>All generation history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-500 mt-0.5">•</span>
                  <span>All branches and their data</span>
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-2">
          <AlertDialogCancel 
            disabled={isPending}
            className="px-5 py-2.5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-all"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? "Deleting..." : "Delete World"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
