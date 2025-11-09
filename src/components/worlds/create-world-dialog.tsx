"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createWorldAction } from "@/app/actions/worlds";
import { Sparkles } from "lucide-react";

interface CreateWorldDialogProps {
  children: React.ReactNode;
}

export function CreateWorldDialog({ children }: CreateWorldDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createWorldAction(formData);

      if (result.success) {
        toast.success("World created successfully!", {
          description: "Start adding entities to build your creative universe.",
        });
        setOpen(false);
        router.refresh();
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Create New World</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-500 leading-relaxed">
              Create a new world to organize your creative project. Add entities, generate content, and maintain consistency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2.5">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="My Creative World"
                required
                maxLength={255}
                disabled={isPending}
                className="h-11 px-4 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 transition-all"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your world, its theme, and purpose..."
                rows={4}
                maxLength={5000}
                disabled={isPending}
                className="px-4 py-3 border-gray-300 rounded-lg resize-none focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 transition-all"
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="tags" className="text-sm font-semibold text-gray-700">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="sci-fi, fantasy, cyberpunk"
                disabled={isPending}
                className="h-11 px-4 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 transition-all"
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-lg">
                {error}
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? "Creating..." : "Create World"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
