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

async function executeRateLimit(rateLimitKey: string, config: RateLimitConfig) {
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
      return { success: true, remaining: config.max - 1 };
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
      return { success: true, remaining: config.max - 1 };
    }

    if (record.count >= config.max) {
      // Limit exceeded
      const retryAfter = Number((windowMs - timePassed) / BigInt(1000));
      const waitTime = Math.max(1, retryAfter);
      return {
        success: false,
        retryAfter: waitTime,
        message: formatRetryAfter(waitTime),
      };
    }

    // Increment count
    await tx.rateLimit.update({
      where: { id: rateLimitKey },
      data: {
        count: record.count + 1,
      },
    });

    return { success: true, remaining: config.max - (record.count + 1) };
  });

  return result;
}

export async function checkRateLimit(config: RateLimitConfig) {
  // Use userId for authenticated users (prevents IP spoofing attacks)
  if (config.userId) {
    const rateLimitKey = `${config.userId}|${config.key}`;
    return await executeRateLimit(rateLimitKey, config);
  }

  // For unauthenticated users, get the real client IP
  const headerList = await headers();
  
  // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
  // The first IP is the original client, but can be spoofed
  // We combine it with other headers to create a more reliable identifier
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  
  // Get the first IP from x-forwarded-for (most likely the real client)
  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
  
  // Create a composite key that's harder to spoof by including user-agent
  // This makes it harder to bypass by just spoofing x-forwarded-for
  const userAgent = headerList.get("user-agent") || "";
  const ipHash = `${clientIp}:${userAgent.slice(0, 50)}`; // Limit user-agent length
  
  const rateLimitKey = `${ipHash}|${config.key}`;
  return await executeRateLimit(rateLimitKey, config);
}
