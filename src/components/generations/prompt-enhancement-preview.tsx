"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Entity, EntityImage } from "@/types";
import Image from "next/image";

interface EntityWithImage extends Entity {
  primaryImage: EntityImage | null;
}

interface PromptEnhancementPreviewProps {
  originalPrompt: string;
  enhancedPrompt: string;
  entities: EntityWithImage[];
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  character: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  location: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  object: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  style: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
  custom: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

export default function PromptEnhancementPreview({
  originalPrompt,
  enhancedPrompt,
  entities,
}: PromptEnhancementPreviewProps) {
  // Highlight entity names in the prompts
  const highlightedOriginal = useMemo(() => {
    let highlighted = originalPrompt;

    entities.forEach((entity) => {
      const regex = new RegExp(`\\b(${entity.name})\\b`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<mark class="entity-highlight" data-entity-id="${entity.id}">$1</mark>`
      );
    });

    return highlighted;
  }, [originalPrompt, entities]);

  const highlightedEnhanced = useMemo(() => {
    let highlighted = enhancedPrompt;

    entities.forEach((entity) => {
      // Match entity name with attributes in parentheses
      const regex = new RegExp(
        `\\b(${entity.name})\\s*\\([^)]+\\)`,
        "gi"
      );
      highlighted = highlighted.replace(
        regex,
        `<mark class="entity-highlight-enhanced" data-entity-id="${entity.id}">$&</mark>`
      );
    });

    return highlighted;
  }, [enhancedPrompt, entities]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="diff">Diff View</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original Prompt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Original Prompt</h4>
                <Badge variant="outline" className="text-xs">
                  {originalPrompt.length} chars
                </Badge>
              </div>
              <div
                className="p-4 rounded-md bg-muted/50 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedOriginal }}
                style={{
                  wordBreak: "break-word",
                }}
              />
            </div>

            {/* Enhanced Prompt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Enhanced Prompt</h4>
                <Badge variant="outline" className="text-xs">
                  {enhancedPrompt.length} chars
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  +{enhancedPrompt.length - originalPrompt.length} chars
                </Badge>
              </div>
              <div
                className="p-4 rounded-md bg-primary/5 border border-primary/20 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedEnhanced }}
                style={{
                  wordBreak: "break-word",
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="space-y-4">
          <div className="space-y-2">
            <div className="p-4 rounded-md bg-muted/50 text-sm leading-relaxed font-mono">
              <div className="text-red-600 dark:text-red-400 mb-2">
                - {originalPrompt}
              </div>
              <div className="text-green-600 dark:text-green-400">
                + {enhancedPrompt}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entity Cards */}
      {entities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Entities Used</h4>
          <div className="grid gap-3">
            {entities.map((entity) => (
              <Card
                key={entity.id}
                className={cn(
                  "p-3 border",
                  ENTITY_TYPE_COLORS[entity.type]
                )}
              >
                <div className="flex items-start gap-3">
                  {entity.primaryImage && (
                    <Image
                      src={entity.primaryImage.url}
                      alt={`${entity.name} ${entity.type} entity thumbnail`}
                      className="w-16 h-16 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{entity.name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        {entity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entity.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .entity-highlight {
          background-color: hsl(var(--primary) / 0.2);
          color: hsl(var(--primary));
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 500;
        }
        .entity-highlight-enhanced {
          background-color: hsl(var(--primary) / 0.3);
          color: hsl(var(--primary));
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 500;
          border-bottom: 2px solid hsl(var(--primary));
        }
      `}</style>
    </div>
  );
}
