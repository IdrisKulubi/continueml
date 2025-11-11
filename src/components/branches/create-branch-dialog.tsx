"use client";

import { useState, useTransition, useEffect } from "react";
import { Branch } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, GitBranch, Info } from "lucide-react";
import { createBranchAction, getBranchEntityCountAction } from "@/app/actions/branches";
import { useBranchStore } from "@/lib/stores/branch-store";
import { useToast } from "@/hooks/use-toast";

interface CreateBranchDialogProps {
  worldId: string;
  branches: Branch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBranchDialog({
  worldId,
  branches,
  open,
  onOpenChange,
}: CreateBranchDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentBranchId, setParentBranchId] = useState<string>("");
  const [entityCount, setEntityCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const { addBranch, setCurrentBranch } = useBranchStore();
  const { toast } = useToast();

  // Load entity count when parent branch changes
  useEffect(() => {
    if (!open) return;

    const loadEntityCount = async () => {
      setLoadingCount(true);
      try {
        if (parentBranchId) {
          const result = await getBranchEntityCountAction(parentBranchId);
          if (result.success) {
            setEntityCount(result.data.count);
          }
        } else {
          // For main branch, we'd need to count entities with null branchId
          // For now, just show a placeholder
          setEntityCount(null);
        }
      } catch (error) {
        console.error("Error loading entity count:", error);
      } finally {
        setLoadingCount(false);
      }
    };

    loadEntityCount();
  }, [parentBranchId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Branch name is required",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (parentBranchId) {
        formData.append("parentBranchId", parentBranchId);
      }

      const result = await createBranchAction(worldId, formData);

      if (result.success) {
        // Add to store and set as current
        addBranch(result.data);
        setCurrentBranch(result.data);

        toast({
          title: "Branch Created",
          description: `Successfully created branch "${result.data.name}"`,
        });

        // Reset form and close dialog
        setName("");
        setDescription("");
        setParentBranchId("");
        setEntityCount(null);
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create branch",
          variant: "destructive",
        });
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      // Reset form when closing
      setName("");
      setDescription("");
      setParentBranchId("");
      setEntityCount(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Create New Branch
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create an alternate version of your world to experiment with different
              creative directions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">
                Branch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alternate Ending, Dark Timeline"
                disabled={isPending}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            {/* Description input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this branch different..."
                disabled={isPending}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Parent branch selection */}
            <div className="space-y-2">
              <Label htmlFor="parentBranch" className="text-gray-900 dark:text-gray-100">
                Branch From
              </Label>
              <Select
                value={parentBranchId}
                onValueChange={setParentBranchId}
                disabled={isPending}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Main (default)" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectItem value="">Main</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select which branch to copy entities from
              </p>
            </div>

            {/* Entity count info */}
            {(entityCount !== null || loadingCount) && (
              <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {loadingCount ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading entity count...
                    </span>
                  ) : (
                    <span>
                      <strong>{entityCount}</strong> {entityCount === 1 ? "entity" : "entities"} will be copied to the new branch
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Branch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
