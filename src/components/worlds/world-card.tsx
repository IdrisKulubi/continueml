"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { World } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Archive, Trash2, Globe, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditWorldDialog } from "./edit-world-dialog";
import { DeleteWorldDialog } from "./delete-world-dialog";

interface WorldCardProps {
  world: World;
}

export function WorldCard({ world }: WorldCardProps) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = () => {
    router.push(`/worlds/${world.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  return (
    <>
      <div
        className="group relative bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-indigo-300 dark:hover:border-indigo-700"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
              {world.name}
            </h3>
            {world.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {world.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 ml-2 opacity-100 transition-opacity hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer py-2.5">
                <Edit className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive} className="cursor-pointer py-2.5">
                <Archive className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium">Archive</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30">
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {world.tags && world.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {world.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium px-3 py-1 rounded-full border-0"
              >
                {tag}
              </Badge>
            ))}
            {world.tags.length > 3 && (
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full border-0">
                +{world.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">0 entities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" strokeWidth={2} />
            <span>{formatDistanceToNow(new Date(world.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <EditWorldDialog
        world={world}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteWorldDialog
        world={world}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
