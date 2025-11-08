"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { World } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Archive, Trash2, Globe } from "lucide-react";
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
    // Archive functionality will be implemented in edit dialog
    setShowEditDialog(true);
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-1 truncate">{world.name}</CardTitle>
              {world.description && (
                <CardDescription className="line-clamp-2">
                  {world.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {world.tags && world.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {world.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {world.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{world.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              <span>0 entities</span>
            </div>
            <div>
              Updated {formatDistanceToNow(new Date(world.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>

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
