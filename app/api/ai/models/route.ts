import { NextResponse } from "next/server";
import { getAvailableModelCount, getLoadBalancerStats } from "@/lib/vanchin-client";

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/models
 * Returns the count of available AI models (Vanchin API keys)
 */
export async function GET() {
  try {
    const modelCount = getAvailableModelCount();
    const stats = getLoadBalancerStats();

    return NextResponse.json({
      success: true,
      count: modelCount,
      healthy: stats.healthyKeys,
      unhealthy: stats.unhealthyKeys,
      stats: stats,
    });
  } catch (error) {
    console.error("Error getting model count:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to get model count" 
      },
      { status: 500 }
    );
  }
}
