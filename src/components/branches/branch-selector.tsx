"use client";

import { useState, useEffect } from "react";
import { useRouter} from "next/navigation";
import { Branch } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitBranch, Plus, Check } from "lucide-react";
import { useBranchStore } from "@/lib/stores/branch-store";
import { CreateBranchDialog } from "./create-branch-dialog";

interface BranchSelectorProps {
  worldId: string;
  branches: Branch[];
  className?: string;
}

export function BranchSelector({ worldId, branches, className }: BranchSelectorProps) {
  const router = useRouter();
  const { currentBranch, setCurrentBranch, setBranches } = useBranchStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Update branches in store when prop changes
  useEffect(() => {
    setBranches(branches);
  }, [branches, setBranches]);

  // Determine the display name for current selection
  const displayName = currentBranch ? currentBranch.name : "Main";

  const handleBranchSwitch = (branch: Branch | null) => {
    setCurrentBranch(branch);
    
    // Refresh the current page to load data for the new branch
    router.refresh();
  };

  const handleCreateBranch = () => {
    setShowCreateDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors ${className}`}
          >
            <GitBranch className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 rounded-lg shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Switch Branch
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Main branch */}
          <DropdownMenuItem
            onClick={() => handleBranchSwitch(null)}
            className="cursor-pointer py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Main</span>
            </div>
            {!currentBranch && (
              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </DropdownMenuItem>

          {/* Branch list */}
          {branches.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleBranchSwitch(branch)}
                  className="cursor-pointer py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GitBranch className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">{branch.name}</span>
                  </div>
                  {currentBranch?.id === branch.id && (
                    <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          
          {/* Create branch button */}
          <DropdownMenuItem
            onClick={handleCreateBranch}
            className="cursor-pointer py-2.5 text-indigo-600 dark:text-indigo-400 focus:text-indigo-600 dark:focus:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-950/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-medium">Create Branch</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBranchDialog
        worldId={worldId}
        branches={branches}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
