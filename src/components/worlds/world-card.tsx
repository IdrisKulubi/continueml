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
        className="group relative bg-white border border-gray-100 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-indigo-200"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
              {world.name}
            </h3>
            {world.description && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {world.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border-gray-200">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer py-2.5">
                <Edit className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive} className="cursor-pointer py-2.5">
                <Archive className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Archive</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
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
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium px-3 py-1 rounded-full border-0"
              >
                {tag}
              </Badge>
            ))}
            {world.tags.length > 3 && (
              <Badge className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full border-0">
                +{world.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
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
