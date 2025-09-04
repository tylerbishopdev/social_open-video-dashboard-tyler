import { NextRequest, NextResponse } from "next/server";
import { searchWithPerplexity } from "@/lib/perplexity";
import { generateDailySearchQuery } from "@/lib/search-topics";

export async function GET(request: NextRequest) {
  try {
    // Verify this is called from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const isFromVercelCron =
      authHeader?.startsWith("Bearer ") &&
      request.headers.get("user-agent")?.includes("vercel");

    if (!isFromVercelCron && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform the daily search
    const query = generateDailySearchQuery();
    const discussions = await searchWithPerplexity(query);

    // In production, you would save this to a database
    // For now, the client will handle storage
    const report = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      date: new Date().toISOString(),
      discussions,
      searchQuery: query,
      createdAt: new Date().toISOString(),
      status: "completed",
    };

    return NextResponse.json({
      success: true,
      report,
      message: `Found ${discussions.length} discussions`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute daily search" },
      { status: 500 }
    );
  }
}
