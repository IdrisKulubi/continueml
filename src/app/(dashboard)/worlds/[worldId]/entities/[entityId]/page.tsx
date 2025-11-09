import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DotPattern } from "@/components/ui/dot-pattern";
import { getEntityByIdAction } from "@/app/actions/entities";
import { getCurrentUserId } from "@/lib/auth/session";
import { worldService } from "@/lib/worlds/world-service";
import { EntityImageGallery } from "@/components/entities/entity-image-gallery";
import { EntityActions } from "@/components/entities/entity-actions";
import {
  User,
  MapPin,
  Box,
  Palette,
  Layers,
  Calendar,
  Clock,
  TrendingUp,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { EntityType } from "@/types";

interface PageProps {
  params: Promise<{ worldId: string; entityId: string }>;
}

const entityTypeConfig: Record<
  EntityType,
  { icon: any; color: string; label: string }
> = {
  character: {
    icon: User,
    color: "bg-blue-500 text-white",
    label: "Character",
  },
  location: {
    icon: MapPin,
    color: "bg-purple-500 text-white",
    label: "Location",
  },
  object: {
    icon: Box,
    color: "bg-orange-500 text-white",
    label: "Object",
  },
  style: {
    icon: Palette,
    color: "bg-pink-500 text-white",
    label: "Style",
  },
  custom: {
    icon: Layers,
    color: "bg-gray-500 text-white",
    label: "Custom",
  },
};

export default async function EntityDetailPage({ params }: PageProps) {
  const { worldId, entityId } = await params;

  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  // Verify world ownership
  const world = await worldService.getWorldById(worldId, userId);
  if (!world) {
    notFound();
  }

  // Fetch entity
  const result = await getEntityByIdAction(entityId);

  if (!result.success || !result.data) {
    notFound();
  }

  const { entity, images } = result.data;

  // Verify entity belongs to this world
  if (entity.worldId !== worldId) {
    notFound();
  }

  const config = entityTypeConfig[entity.type];
  const Icon = config.icon;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/30">
      {/* Animated Dot Pattern Background */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1.2}
        className="text-indigo-400/40 dark:text-indigo-400/20"
        glow={true}
      />
      
      {/* Gradient Overlay for better contrast */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white/80 dark:via-gray-950/50 dark:to-gray-950/80 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Badge className={`${config.color} border-0 px-3 py-1`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            {entity.isArchived && (
              <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
                Archived
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {entity.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(entity.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(new Date(entity.updatedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>Used {entity.usageCount} times</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/worlds/${worldId}/entities/${entityId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <EntityActions entity={entity} worldId={worldId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Images
            </h2>
            <EntityImageGallery images={images} entityId={entityId} worldId={worldId} />
          </section>

          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Description
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {entity.description}
              </p>
            </div>
          </section>

          {/* Related Generations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Related Generations
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No generations yet. Use this entity in a generation to see it here.
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {entity.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Metadata
            </h3>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entity ID</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {entity.id}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">World ID</p>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {entity.worldId}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(entity.createdAt).toLocaleString()}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(entity.updatedAt).toLocaleString()}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usage Count</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {entity.usageCount} generations
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/worlds/${worldId}/generate?entity=${entityId}`}>
                  Use in Generation
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href={`/worlds/${worldId}/entities?search=${entity.name}`}>
                  Find Similar
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
