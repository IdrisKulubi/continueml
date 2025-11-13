"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConsistencyBadge from "./consistency-badge";
import type { ConsistencyAnalysis } from "@/lib/consistency/consistency-service";
import type { Entity, EntityImage } from "@/types";

interface ConsistencyAnalysisViewProps {
  analysis: ConsistencyAnalysis;
  generatedContentUrl: string;
  referenceEntities: Array<Entity & { images: EntityImage[] }>;
  onRegenerate?: () => void;
  onUpdateMemory?: () => void;
  onCreateVariant?: () => void;
  isLoading?: boolean;
}

export default function ConsistencyAnalysisView({
  analysis,
  generatedContentUrl,
  referenceEntities,
  onRegenerate,
  onUpdateMemory,
  onCreateVariant,
  isLoading = false,
}: ConsistencyAnalysisViewProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingVariant, setIsCreatingVariant] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUpdateMemory = async () => {
    if (!onUpdateMemory) return;
    setIsUpdating(true);
    try {
      await onUpdateMemory();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateVariant = async () => {
    if (!onCreateVariant) return;
    setIsCreatingVariant(true);
    try {
      await onCreateVariant();
    } finally {
      setIsCreatingVariant(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "low":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consistency Analysis</CardTitle>
              <CardDescription>
                Comparison between generated content and entity references
              </CardDescription>
            </div>
            <ConsistencyBadge score={analysis.overallScore} showIcon showTooltip />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Visual Consistency</span>
                <span className="text-sm text-muted-foreground">{analysis.visualScore}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.visualScore >= 90
                      ? "bg-green-500"
                      : analysis.visualScore >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${analysis.visualScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Semantic Consistency</span>
                <span className="text-sm text-muted-foreground">{analysis.semanticScore}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.semanticScore >= 90
                      ? "bg-green-500"
                      : analysis.semanticScore >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                  )}
                  style={{ width: `${analysis.semanticScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recommendation Alert */}
          <Alert
            className={cn(
              analysis.recommendation === "accept"
                ? "border-green-500/50 bg-green-500/10"
                : analysis.recommendation === "review"
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-red-500/50 bg-red-500/10"
            )}
          >
            <AlertDescription className="flex items-start gap-2">
              {analysis.recommendation === "accept" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              ) : analysis.recommendation === "review" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              )}
              <span className="text-sm">{analysis.message}</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Comparison</CardTitle>
          <CardDescription>
            Compare generated content with entity references
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generated Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Generated Content</h4>
                <Badge variant="outline">Result</Badge>
              </div>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                <Image
                  src={generatedContentUrl}
                  alt="Generated content being analyzed for consistency with entity references"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Reference Entities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Reference Entities</h4>
                <Badge variant="outline">{referenceEntities.length} entities</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {referenceEntities.map((entity) => {
                  const primaryImage = entity.images.find((img) => img.isPrimary) || entity.images[0];
                  return (
                    <div key={entity.id} className="space-y-1">
                      {primaryImage && (
                        <div className="relative aspect-square rounded-md overflow-hidden bg-muted border">
                          <Image
                            src={primaryImage.url}
                            alt={`Reference image for ${entity.name} entity used in consistency comparison`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <p className="text-xs font-medium truncate">{entity.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drifted Attributes */}
      {analysis.driftedAttributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Issues</CardTitle>
            <CardDescription>
              Attributes that may have drifted from entity references
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.driftedAttributes.map((drift, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border",
                    getSeverityColor(drift.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(drift.severity)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{drift.attribute}</h4>
                        <Badge variant="outline" className="text-xs">
                          {drift.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Expected:</span> {drift.expectedValue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Issue:</span> {drift.detectedIssue}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Choose how to proceed with this generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {onRegenerate && (
              <Button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                variant={analysis.recommendation === "regenerate" ? "default" : "outline"}
                className="gap-2"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate with Stricter Constraints
              </Button>
            )}

            {onUpdateMemory && (
              <Button
                onClick={handleUpdateMemory}
                disabled={isUpdating}
                variant="outline"
                className="gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update Entity Memory
              </Button>
            )}

            {onCreateVariant && (
              <Button
                onClick={handleCreateVariant}
                disabled={isCreatingVariant}
                variant="outline"
                className="gap-2"
              >
                {isCreatingVariant ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Create Variant Entity
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
