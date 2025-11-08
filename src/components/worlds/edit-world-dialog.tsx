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

  // Reset form when dialog opens with new world
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
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit World</DialogTitle>
            <DialogDescription>
              Update your world details or archive it to hide from the main list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={world.name}
                placeholder="My Creative World"
                required
                maxLength={255}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={world.description || ""}
                placeholder="Describe your world, its theme, and purpose..."
                rows={4}
                maxLength={5000}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                name="tags"
                defaultValue={world.tags.join(", ")}
                placeholder="sci-fi, fantasy, cyberpunk (comma-separated)"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="archive-toggle">Archive World</Label>
                <p className="text-sm text-muted-foreground">
                  Hide this world from the main list
                </p>
              </div>
              <Switch
                id="archive-toggle"
                checked={isArchived}
                onCheckedChange={setIsArchived}
                disabled={isPending}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
