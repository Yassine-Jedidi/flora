"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function updateProfile(values: { name: string; image?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user to check for old image
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    // Update user in database
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: values.name,
        ...(values.image && { image: values.image }),
      },
    });

    // If we updated the image, and there was an old one from UploadThing, delete it
    if (
      values.image &&
      currentUser?.image &&
      currentUser.image !== values.image &&
      currentUser.image.includes("utfs.io")
    ) {
      const oldKey = currentUser.image.split("/").pop();
      if (oldKey) {
        try {
          await utapi.deleteFiles(oldKey);
          console.log("Deleted old confirmed profile image:", oldKey);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function deleteUploadedFile(fileUrl: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    if (!fileUrl.includes("utfs.io")) {
      return { success: false, error: "Invalid file URL" };
    }

    const fileKey = fileUrl.split("/").pop();
    if (!fileKey) {
      return { success: false, error: "Invalid file key" };
    }

    await utapi.deleteFiles(fileKey);
    console.log("Deleted uploaded file:", fileKey);

    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    return { success: false, error: "Failed to delete file" };
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
