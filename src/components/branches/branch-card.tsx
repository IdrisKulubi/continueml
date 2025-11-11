"use client";

import { useState, useEffect } from "react";
import { Branch } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Trash2, Clock, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeleteBranchDialog } from "./delete-branch-dialog";
import { getBranchEntityCountAction } from "@/app/actions/branches";
import { useBranchStore } from "@/lib/stores/branch-store";

interface BranchCardProps {
  branch: Branch;
  parentBranchName?: string;
}

export function BranchCard({ branch, parentBranchName }: BranchCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entityCount, setEntityCount] = useState<number | null>(null);
  const { currentBranch, setCurrentBranch } = useBranchStore();
  const isCurrentBranch = currentBranch?.id === branch.id;

  // Load entity count
  useEffect(() => {
    const loadEntityCount = async () => {
      const result = await getBranchEntityCountAction(branch.id);
      if (result.success) {
        setEntityCount(result.data.count);
      }
    };
    loadEntityCount();
  }, [branch.id]);

  const handleSwitchToBranch = () => {
    setCurrentBranch(branch);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-gray-900 border rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 ${
          isCurrentBranch
            ? "border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800/50"
            : "border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                {branch.name}
              </h3>
              {isCurrentBranch && (
                <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-0 text-xs">
                  Current
                </Badge>
              )}
            </div>
            {branch.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {branch.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 ml-2 opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete branch</span>
          </Button>
        </div>

        {/* Parent branch info */}
        {parentBranchName && (
          <div className="mb-4">
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 text-xs">
              Branched from: {parentBranchName}
            </Badge>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" strokeWidth={2} />
              <span className="font-medium">
                {entityCount !== null ? `${entityCount} entities` : "Loading..."}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" strokeWidth={2} />
              <span>
                {formatDistanceToNow(new Date(branch.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {!isCurrentBranch && (
            <Button
              onClick={handleSwitchToBranch}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Switch to Branch
            </Button>
          )}
        </div>
      </div>

      <DeleteBranchDialog
        branch={branch}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
