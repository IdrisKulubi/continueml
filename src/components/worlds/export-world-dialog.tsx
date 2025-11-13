"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Loader2, CheckCircle2, Clock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportWorldBibleAction, getExportSizeEstimateAction } from "@/app/actions/export";
import { getEntitiesAction } from "@/app/actions/entities";
import { toast } from "sonner";
import type { Entity } from "@/types";

interface ExportWorldDialogProps {
  worldId: string;
  worldName: string;
}

type ExportState = "idle" | "exporting" | "success";

export function ExportWorldDialog({ worldId, worldName }: ExportWorldDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Load entities and estimate when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    
    if (newOpen) {
      // Reset state
      setExportState("idle");
      setDownloadUrl(null);
      setExpiresAt(null);
      
      // Load entities if not already loaded
      if (entities.length === 0) {
        setIsLoadingEntities(true);
        try {
          const result = await getEntitiesAction(worldId, {
            isArchived: false,
          });
          if (result.success) {
            setEntities(result.data);
            // Select all by default
            setSelectedEntityIds(result.data.map((e) => e.id));
          } else {
            toast.error("Failed to load entities", {
              description: result.error,
            });
          }
        } catch (error) {
          console.error("Error loading entities:", error);
          toast.error("Failed to load entities");
        } finally {
          setIsLoadingEntities(false);
        }
      }
      
      // Load estimate
      if (estimatedSize === null) {
        setIsLoadingEstimate(true);
        try {
          const result = await getExportSizeEstimateAction({ worldId });
          if (result.success) {
            setEstimatedSize(result.data.estimatedSizeMB);
          }
        } catch (error) {
          console.error("Error loading estimate:", error);
        } finally {
          setIsLoadingEstimate(false);
        }
      }
    }
  };

  // Update estimate when selection changes
  useEffect(() => {
    if (selectedEntityIds.length > 0 && selectedEntityIds.length < entities.length) {
      setIsLoadingEstimate(true);
      getExportSizeEstimateAction({ 
        worldId, 
        entityIds: selectedEntityIds 
      })
        .then((result) => {
          if (result.success) {
            setEstimatedSize(result.data.estimatedSizeMB);
          }
        })
        .catch((error) => {
          console.error("Error updating estimate:", error);
        })
        .finally(() => {
          setIsLoadingEstimate(false);
        });
    }
  }, [selectedEntityIds, worldId, entities.length]);

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expires = expiresAt.getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleSelectAll = () => {
    setSelectedEntityIds(entities.map((e) => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedEntityIds([]);
  };

  const toggleEntity = (entityId: string) => {
    setSelectedEntityIds((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
  };

  const handleExport = async () => {
    if (selectedEntityIds.length === 0) {
      toast.error("Please select at least one entity to export");
      return;
    }

    setExportState("exporting");
    
    try {
      const result = await exportWorldBibleAction({
        worldId,
        format: "pdf",
        entityIds: selectedEntityIds.length === entities.length ? undefined : selectedEntityIds,
      });

      if (result.success) {
        setDownloadUrl(result.data.downloadUrl);
        setExpiresAt(new Date(result.data.expiresAt));
        setExportState("success");
        
        toast.success("World Bible exported successfully!", {
          description: "Your download is ready",
        });
      } else {
        toast.error("Export failed", {
          description: result.error,
        });
        setExportState("idle");
      }
    } catch (error) {
      console.error("Error exporting world:", error);
      toast.error("Export failed", {
        description: "An unexpected error occurred",
      });
      setExportState("idle");
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setExportState("idle");
      setDownloadUrl(null);
      setExpiresAt(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export World Bible
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Export World Bible</DialogTitle>
          <DialogDescription>
            Generate a comprehensive PDF document containing entities, images, and
            descriptions from "{worldName}".
          </DialogDescription>
        </DialogHeader>

        {exportState === "success" && downloadUrl ? (
          // Success State - Show download link
          <div className="space-y-4 py-6">
            <div className="flex flex-col items-center justify-center gap-4 p-6 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                  Export Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your World Bible is ready to download
                </p>
              </div>
            </div>

            {/* Expiration Timer */}
            {expiresAt && (
              <div className="flex items-center justify-center gap-2 p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Link expires in:</strong> {timeRemaining}
                </p>
              </div>
            )}

            {/* Download Button */}
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        ) : (
          // Configuration State
          <div className="space-y-4 py-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <FileText className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">PDF Document</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Professional format with images and formatting
                  </p>
                </div>
              </div>
            </div>

            {/* Entity Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Entities</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isLoadingEntities || exportState === "exporting"}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isLoadingEntities || exportState === "exporting"}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              {isLoadingEntities ? (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : entities.length === 0 ? (
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No entities found in this world
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[200px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {entities.map((entity) => (
                      <div
                        key={entity.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded"
                      >
                        <Checkbox
                          id={`entity-${entity.id}`}
                          checked={selectedEntityIds.includes(entity.id)}
                          onCheckedChange={() => toggleEntity(entity.id)}
                          disabled={exportState === "exporting"}
                        />
                        <label
                          htmlFor={`entity-${entity.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <span className="font-medium">{entity.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({entity.type})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedEntityIds.length} of {entities.length} entities selected
              </p>
            </div>

            {/* Estimated Size */}
            <div className="space-y-2">
              <Label>Estimated File Size</Label>
              <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                {isLoadingEstimate ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </div>
                ) : estimatedSize !== null ? (
                  <p className="text-sm font-medium">
                    ~{estimatedSize} MB
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unable to estimate
                  </p>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> The export includes selected entities with
                their reference images and descriptions. The download link will be valid
                for 24 hours.
              </p>
            </div>
          </div>
        )}

        {exportState !== "success" && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={exportState === "exporting"}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={exportState === "exporting" || selectedEntityIds.length === 0}
            >
              {exportState === "exporting" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
