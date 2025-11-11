"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { Entity, EntityImage, GenerationTool } from "@/types";
import { createGenerationAction } from "@/app/actions/generations";
import { useBranchStore } from "@/lib/stores/branch-store";
import EntitySelector from "./entity-selector";
import PromptEnhancementPreview from "./prompt-enhancement-preview";

interface EntityWithImage extends Entity {
  primaryImage: EntityImage | null;
}

interface GenerationInterfaceProps {
  worldId: string;
  userId: string;
  entities: EntityWithImage[];
}

const GENERATION_TOOLS: { value: GenerationTool; label: string }[] = [
  { value: "runway", label: "Runway" },
  { value: "midjourney", label: "Midjourney" },
  { value: "stable_diffusion", label: "Stable Diffusion" },
  { value: "other", label: "Other" },
];

export default function GenerationInterface({
  worldId,
  userId,
  entities,
}: GenerationInterfaceProps) {
  const router = useRouter();
  const { currentBranch } = useBranchStore();
  const [prompt, setPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<GenerationTool>("runway");
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [detectedEntityIds, setDetectedEntityIds] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Detect entity names in prompt (client-side)
  const detectedEntities = useMemo(() => {
    if (!prompt.trim()) return [];

    const lowerPrompt = prompt.toLowerCase();
    return entities.filter((entity) => {
      const lowerName = entity.name.toLowerCase();
      const regex = new RegExp(`\\b${lowerName}\\b`, "i");
      return regex.test(prompt);
    });
  }, [prompt, entities]);

  // Update detected entity IDs when detection changes
  useEffect(() => {
    setDetectedEntityIds(detectedEntities.map((e) => e.id));
  }, [detectedEntities]);

  // Generate enhanced prompt preview (client-side approximation)
  useEffect(() => {
    if (!prompt.trim()) {
      setEnhancedPrompt("");
      return;
    }

    // Use manual selection if provided, otherwise use detected entities
    const entitiesToUse =
      selectedEntityIds.length > 0
        ? entities.filter((e) => selectedEntityIds.includes(e.id))
        : detectedEntities;

    if (entitiesToUse.length === 0) {
      setEnhancedPrompt(prompt);
      return;
    }

    let enhanced = prompt;

    for (const entity of entitiesToUse) {
      // Extract first 3 sentences or phrases as attributes
      const sentences = entity.description
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const attributes = sentences.slice(0, 3);

      if (attributes.length > 0) {
        const attributeString = attributes.join(", ");
        const regex = new RegExp(`\\b(${entity.name})\\b`, "gi");
        enhanced = enhanced.replace(regex, `$1 (${attributeString})`);
      }
    }

    setEnhancedPrompt(enhanced);
  }, [prompt, selectedEntityIds, detectedEntities, entities]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!selectedTool) {
      toast.error("Please select a generation tool");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createGenerationAction({
        worldId,
        userId,
        originalPrompt: prompt,
        entityIds: selectedEntityIds.length > 0 ? selectedEntityIds : detectedEntityIds,
        tool: selectedTool,
        branchId: currentBranch?.id,
      });

      if (result.success && result.data) {
        toast.success("Generation created successfully!");
        router.push(`/worlds/${worldId}/history`);
      } else {
        toast.error(result.error?.message || "Failed to create generation");
      }
    } catch (error) {
      console.error("Error creating generation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEnhancedPrompt = async () => {
    if (!enhancedPrompt) return;

    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setIsCopied(true);
      toast.success("Enhanced prompt copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generation Prompt
          </CardTitle>
          <CardDescription>
            Enter your prompt below. Entity names will be automatically detected and enhanced.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Show me Alex walking through the forest at sunset..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {detectedEntities.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Detected entities:</span>
                <div className="flex flex-wrap gap-1">
                  {detectedEntities.map((entity) => (
                    <Badge key={entity.id} variant="secondary" className="text-xs">
                      {entity.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Entity Selector */}
          <div className="space-y-2">
            <Label>Entity Selection (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Manually select entities to override automatic detection
            </p>
            <EntitySelector
              entities={entities}
              selectedEntityIds={selectedEntityIds}
              onSelectionChange={setSelectedEntityIds}
            />
          </div>

          {/* Tool Selector */}
          <div className="space-y-2">
            <Label htmlFor="tool">Generation Tool</Label>
            <Select value={selectedTool} onValueChange={(value) => setSelectedTool(value as GenerationTool)}>
              <SelectTrigger id="tool">
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_TOOLS.map((tool) => (
                  <SelectItem key={tool.value} value={tool.value}>
                    {tool.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Prompt Preview */}
      {enhancedPrompt && enhancedPrompt !== prompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enhanced Prompt Preview</CardTitle>
                <CardDescription>
                  Your prompt with entity attributes automatically injected
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEnhancedPrompt}
                className="gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PromptEnhancementPreview
              originalPrompt={prompt}
              enhancedPrompt={enhancedPrompt}
              entities={entities.filter((e) =>
                (selectedEntityIds.length > 0 ? selectedEntityIds : detectedEntityIds).includes(e.id)
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !prompt.trim()}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Create Generation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
