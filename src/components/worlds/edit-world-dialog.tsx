"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateWorldAction } from "@/app/actions/worlds";
import { World } from "@/types";
import { Edit3 } from "lucide-react";

interface EditWorldDialogProps {
  world: World;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorldDialog({ world, open, onOpenChange }: EditWorldDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isArchived, setIsArchived] = useState(world.isArchived);

  useEffect(() => {
    setIsArchived(world.isArchived);
    setError(null);
  }, [world, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("isArchived", isArchived.toString());

    startTransition(async () => {
      const result = await updateWorldAction(world.id, formData);

      if (result.success) {
        toast.success("World updated successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg">
                <Edit3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit World</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Update your world details or archive it to hide from the main list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500 dark:text-red-400">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={world.name}
                placeholder="My Creative World"
                required
                maxLength={255}
                disabled={isPending}
                className="h-11 px-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={world.description || ""}
                placeholder="Describe your world, its theme, and purpose..."
                rows={4}
                maxLength={5000}
                disabled={isPending}
                className="px-4 py-3 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="edit-tags" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</Label>
              <Input
                id="edit-tags"
                name="tags"
                defaultValue={world.tags.join(", ")}
                placeholder="sci-fi, fantasy, cyberpunk"
                disabled={isPending}
                className="h-11 px-4 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-2 focus:ring-offset-0 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Separate tags with commas
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="space-y-1">
                <Label htmlFor="archive-toggle" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Archive World
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hide this world from the main list
                </p>
              </div>
              <Switch
                id="archive-toggle"
                checked={isArchived}
                onCheckedChange={setIsArchived}
                disabled={isPending}
                className="data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
              />
            </div>
            {error && (
              <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3.5 rounded-lg">
                {error}
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="px-5 py-2.5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
