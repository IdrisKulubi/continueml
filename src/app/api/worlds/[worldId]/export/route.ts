import { NextRequest, NextResponse } from "next/server";
import { exportService } from "@/lib/export";
import { getCurrentUserId } from "@/lib/auth/session";
import { z } from "zod";

// Rate limiting map (in-memory, simple implementation)
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 exports per window

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * POST /api/worlds/[worldId]/export
 * Generate and return a World Bible export
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ worldId: string }> }
) {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 15 * 60, // seconds
        },
        { status: 429 }
      );
    }

    // Get worldId from params
    const { worldId } = await params;

    // Parse request body
    const body = await request.json();
    const schema = z.object({
      entityIds: z.array(z.string().uuid()).optional(),
      format: z.enum(["pdf"]).default("pdf"),
    });

    const { entityIds, format } = schema.parse(body);

    // Generate export
    const result = await exportService.exportWorldBible(
      worldId,
      userId,
      entityIds
    );

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: result.downloadUrl,
        expiresAt: result.expiresAt.toISOString(),
        format,
      },
    });
  } catch (error) {
    console.error("Error in export API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/worlds/[worldId]/export
 * Get export size estimate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ worldId: string }> }
) {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get worldId from params
    const { worldId } = await params;

    // Get entity IDs from query params if provided
    const searchParams = request.nextUrl.searchParams;
    const entityIdsParam = searchParams.get("entityIds");
    const entityIds = entityIdsParam
      ? entityIdsParam.split(",").filter(Boolean)
      : undefined;

    // Calculate estimate
    const estimatedSize = await exportService.estimateExportSize(
      worldId,
      entityIds
    );

    return NextResponse.json({
      success: true,
      data: {
        estimatedSizeMB: estimatedSize,
      },
    });
  } catch (error) {
    console.error("Error estimating export size:", error);

    return NextResponse.json(
      { error: "Failed to estimate export size" },
      { status: 500 }
    );
  }
}
