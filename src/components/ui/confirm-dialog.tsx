"use client";

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
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "default" | "destructive" | "warning";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: ConfirmDialogVariant;
  consequences?: string[];
  loading?: boolean;
}

/**
 * Reusable confirmation dialog component
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  consequences,
  loading,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const Icon = variant === "destructive" ? Trash2 : variant === "warning" ? AlertTriangle : Info;
  const iconColor = variant === "destructive" ? "text-destructive" : variant === "warning" ? "text-yellow-500" : "text-blue-500";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", variant === "destructive" ? "bg-destructive/10" : variant === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10")}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {consequences && consequences.length > 0 && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <p className="mb-2 text-sm font-medium text-destructive">
              This action will:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook to use confirmation dialog
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, "open" | "onOpenChange">>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const confirm = (newConfig: Omit<ConfirmDialogProps, "open" | "onOpenChange">) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const dialog = (
    <ConfirmDialog
      {...config}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );

  return { confirm, dialog };
}

/**
 * Delete confirmation dialog preset
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "item",
  consequences,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  consequences?: string[];
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
      consequences={consequences}
      loading={loading}
    />
  );
}

/**
 * Archive confirmation dialog preset
 */
export function ArchiveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "item",
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Archive ${itemType}`}
      description={`Are you sure you want to archive "${itemName}"? You can restore it later from archived items.`}
      confirmText="Archive"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="warning"
      loading={loading}
    />
  );
}

import React from "react";
