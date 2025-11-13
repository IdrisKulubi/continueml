import { NextResponse } from "next/server";
import { queueProcessor } from "@/lib/generations/queue-processor";

/**
 * API route to manually trigger queue processing
 * Can be called via cron job or manually
 */
export async function POST() {
  try {
    // Check if already processing
    if (queueProcessor.isRunning()) {
      return NextResponse.json(
        { message: "Queue processor already running" },
        { status: 409 }
      );
    }

    // Process the queue
    const processedCount = await queueProcessor.processQueue();

    return NextResponse.json({
      success: true,
      processedCount,
      message: `Processed ${processedCount} generation(s)`,
    });
  } catch (error) {
    console.error("Queue processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check queue status
 */
export async function GET() {
  try {
    return NextResponse.json({
      isProcessing: queueProcessor.isRunning(),
    });
  } catch (error) {
    console.error("Queue status check error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
