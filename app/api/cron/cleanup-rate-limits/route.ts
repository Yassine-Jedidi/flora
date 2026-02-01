import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  // 1. Security check: Only allow requests with the Vercel Cron Secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Define the threshold (e.g., delete records older than 24 hours)
    const twentyFourHoursAgo = BigInt(Date.now() - 24 * 60 * 60 * 1000);

    // 3. Perform cleanup
    const result = await db.rateLimit.deleteMany({
      where: {
        lastRequest: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    console.log(`[Cron] Cleaned up ${result.count} stale rate limit records.`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: "Rate limit cleanup completed successfully",
    });
  } catch (error) {
    console.error("[Cron Error] Rate limit cleanup failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
