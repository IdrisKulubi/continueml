"use client";

import { useEffect, useCallback, useState } from "react";

/**
 * Hook to automatically process generation queue
 * Polls every 10 seconds when there are queued items
 */
export function useQueueProcessor(enabled: boolean = true) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedCount, setLastProcessedCount] = useState(0);

  const processQueue = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const response = await fetch("/api/generations/process-queue", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLastProcessedCount(data.processedCount || 0);
      }
    } catch (error) {
      console.error("Failed to process queue:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  useEffect(() => {
    if (!enabled) return;

    // Process immediately on mount
    processQueue();

    // Then poll every 10 seconds
    const interval = setInterval(processQueue, 10000);

    return () => clearInterval(interval);
  }, [enabled, processQueue]);

  return {
    isProcessing,
    lastProcessedCount,
    processQueue,
  };
}
