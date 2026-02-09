import db from "./db";
import { headers } from "next/headers";

interface RateLimitConfig {
  key: string; // Unique key for this rate limit (e.g. "order-creation", "search")
  window: number; // Window in seconds
  max: number; // Max allowed requests in window
  userId?: string; // Optional user ID for authenticated users (prevents IP spoofing)
}

export function formatRetryAfter(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
}

type RateLimitResult =
  | { success: true; remaining: number }
  | { success: false; retryAfter: number; message: string; remaining?: never };

async function executeRateLimit(
  rateLimitKey: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const now = BigInt(Date.now());
  const windowMs = BigInt(config.window * 1000);

  // Use a transaction to ensure atomic updates
  const result = await db.$transaction(async (tx) => {
    const record = await tx.rateLimit.findUnique({
      where: { id: rateLimitKey },
    });

    if (!record) {
      await tx.rateLimit.create({
        data: {
          id: rateLimitKey,
          key: rateLimitKey,
          count: 1,
          lastRequest: now,
        },
      });
      return { success: true, remaining: config.max - 1 } as RateLimitResult;
    }

    const timePassed = now - record.lastRequest;

    if (timePassed > windowMs) {
      // Window expired, reset count
      await tx.rateLimit.update({
        where: { id: rateLimitKey },
        data: {
          count: 1,
          lastRequest: now,
        },
      });
      return { success: true, remaining: config.max - 1 } as RateLimitResult;
    }

    if (record.count >= config.max) {
      // Limit exceeded
      const retryAfter = Number((windowMs - timePassed) / BigInt(1000));
      const waitTime = Math.max(1, retryAfter);
      return {
        success: false,
        retryAfter: waitTime,
        message: formatRetryAfter(waitTime),
      } as RateLimitResult;
    }

    // Increment count
    await tx.rateLimit.update({
      where: { id: rateLimitKey },
      data: {
        count: record.count + 1,
      },
    });

    return {
      success: true,
      remaining: config.max - (record.count + 1),
    } as RateLimitResult;
  });

  return result;
}

export async function checkRateLimit(config: RateLimitConfig) {
  // Always calculate the IP-based identifier first
  const headerList = await headers();

  // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");

  // Get the first IP from x-forwarded-for (most likely the real client)
  let clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "";

  if (!clientIp) {
    // Detect when both headers are missing
    const userAgent = headerList.get("user-agent") || "unknown";
    console.warn(
      `[RateLimit] Missing IP headers for key: ${config.key}. User-Agent: ${userAgent}`,
    );

    // Security-sensitive endpoints are rejected if they can't be identified
    const sensitiveKeys = ["order-creation", "profile-update", "file-delete"];
    if (sensitiveKeys.includes(config.key)) {
      return {
        success: false,
        retryAfter: 60,
        message: "Identification headers missing",
      } as RateLimitResult;
    }

    // Assign a safer per-request fallback for non-sensitive endpoints
    // This prevents shared bucket "double-dipping" or blocking valid anonymous traffic
    clientIp = `req_${Math.random().toString(36).slice(2)}`;
  }

  // Create a composite key that's harder to spoof by including user-agent
  const userAgent = headerList.get("user-agent") || "";
  const ipHash = `${clientIp}:${userAgent.slice(0, 50)}`;

  const ipRateLimitKey = `${ipHash}|${config.key}`;

  // Execute IP rate limit check
  const ipResult = await executeRateLimit(ipRateLimitKey, config);

  // If authenticated, also enforce the user-specific rate limit
  if (config.userId) {
    const userRateLimitKey = `${config.userId}|${config.key}`;
    const userResult = await executeRateLimit(userRateLimitKey, config);

    // Return the more restrictive result (failure first, then lower remaining)
    if (!userResult.success) return userResult;
    if (!ipResult.success) return ipResult;

    return userResult.remaining < ipResult.remaining ? userResult : ipResult;
  }

  // For unauthenticated users, just return the IP result
  return ipResult;
}
