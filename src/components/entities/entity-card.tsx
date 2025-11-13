"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Entity, EntityImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  User,
  MapPin,
  Box,
  Palette,
  Layers,
  TrendingUp,
} from "lucide-react";
import { DeleteEntityDialog } from "./delete-entity-dialog";
import { duplicateEntityAction } from "@/app/actions/entities";
import { toast } from "sonner";

type EntityWithPrimaryImage = Entity & { primaryImage?: EntityImage | null };

interface EntityCardProps {
  entity: EntityWithPrimaryImage;
  worldId: string;
}

const entityTypeConfig = {
  character: {
    icon: User,
    color: "entity-character", // Uses CSS variable with WCAG AA compliant contrast
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    label: "Character",
  },
  location: {
    icon: MapPin,
    color: "entity-location", // Uses CSS variable with WCAG AA compliant contrast
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50",
    label: "Location",
  },
  object: {
    icon: Box,
    color: "entity-object", // Uses CSS variable with WCAG AA compliant contrast
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/50",
    label: "Object",
  },
  style: {
    icon: Palette,
    color: "entity-style", // Uses CSS variable with WCAG AA compliant contrast
    textColor: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800/50",
    label: "Style",
  },
  custom: {
    icon: Layers,
    color: "entity-custom", // Uses CSS variable with WCAG AA compliant contrast
    textColor: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    borderColor: "border-gray-200 dark:border-gray-800/50",
    label: "Custom",
  },
};

export function EntityCard({ entity, worldId }: EntityCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const config = entityTypeConfig[entity.type];
  const Icon = config.icon;

  const handleCardClick = () => {
    router.push(`/worlds/${worldId}/entities/${entity.id}`);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/worlds/${worldId}/entities/${entity.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/worlds/${worldId}/entities/${entity.id}/edit`);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicating(true);

    try {
      const result = await duplicateEntityAction(entity.id);

      if (result.success) {
        toast.success("Entity duplicated successfully (including images)");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to duplicate entity");
      }
    } catch (error) {
      console.error("Error duplicating entity:", error);
      toast.error("Failed to duplicate entity");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <article
        className={`group relative bg-white dark:bg-gray-900 border ${config.borderColor} rounded-2xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`${entity.name}, ${config.label} entity, used ${entity.usageCount} times`}
      >
        {/* Primary Image */}
        <div className="relative w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          {entity.primaryImage ? (
            <Image
              src={entity.primaryImage.url}
              alt={`${entity.name}, a ${config.label.toLowerCase()} entity, showing primary visual reference`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${config.bgColor}`}>
              <Icon className={`w-16 h-16 ${config.textColor} opacity-50`} aria-hidden="true" />
            </div>
          )}

          {/* Entity Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${config.color} text-white border-0 px-3 py-1`} aria-label={`Entity type: ${config.label}`}>
              <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
              {config.label}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900"
                  aria-label={`Actions for ${entity.name}`}
                >
                  <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              >
                <DropdownMenuItem onClick={handleView} className="cursor-pointer py-2.5">
                  <Eye className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  <span className="text-sm font-medium">View</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer py-2.5">
                  <Edit className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  <span className="text-sm font-medium">Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="cursor-pointer py-2.5"
                >
                  <Copy className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                  <span className="text-sm font-medium">
                    {isDuplicating ? "Duplicating..." : "Duplicate"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Entity Name */}
          <h3 className={`text-lg font-semibold ${config.textColor} mb-2 truncate group-hover:text-opacity-80 transition-colors`}>
            {entity.name}
          </h3>

          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {entity.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium px-2 py-0.5 rounded-full border-0"
                >
                  {tag}
                </Badge>
              ))}
              {entity.tags.length > 3 && (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full border-0">
                  +{entity.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Usage Count */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span className="font-medium">Used {entity.usageCount} times</span>
          </div>
        </div>
      </article>

      <DeleteEntityDialog
        entity={entity}
        worldId={worldId}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
