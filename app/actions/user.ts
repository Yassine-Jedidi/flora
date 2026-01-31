"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(values: { name: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Update user in database
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: values.name,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getUserSessions() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const sessions = await db.session.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to 5 most recent
    });

    // Safe map to hide token
    const safeSessions = sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress || "Unknown IP",
      userAgent: s.userAgent || "Unknown Device",
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.token === session.session.token,
    }));

    return { success: true, data: safeSessions };
  } catch (error) {
    console.error("Get sessions error:", error);
    return { success: false, error: "Failed to fetch sessions" };
  }
}

export async function revokeSession(sessionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const targetSession = await db.session.findUnique({
      where: { id: sessionId },
    });

    if (!targetSession || targetSession.userId !== session.user.id) {
      return { success: false, error: "Invalid session" };
    }

    await db.session.delete({
      where: { id: sessionId },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Revoke session error:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}
