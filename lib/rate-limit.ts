import db from "./db";
import { headers } from "next/headers";

interface RateLimitConfig {
  key: string; // Unique key for this rate limit (e.g. "order-creation", "search")
  window: number; // Window in seconds
  max: number; // Max allowed requests in window
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

export async function checkRateLimit(config: RateLimitConfig) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "anonymous";
  const rateLimitKey = `${ip}|${config.key}`;
  const now = BigInt(Date.now());
  const windowMs = BigInt(config.window * 1000);

  // Use a transaction to ensure atomic updates
  const result = await db.$transaction(async (tx) => {
    const record = await tx.rateLimit.findUnique({
      where: { id: rateLimitKey }, // We can use the key as ID for faster lookups
    });

    if (!record) {
      const newRecord = await tx.rateLimit.create({
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
