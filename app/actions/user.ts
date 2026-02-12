"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getTranslations } from "next-intl/server";

const utapi = new UTApi();

import * as z from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2).max(50),
  image: z.string().optional(),
});

export async function updateProfile(values: { name: string; image?: string }) {
  const tProfile = await getTranslations("Errors.profile");

  // Get session first to use userId for rate limiting (prevents IP spoofing)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const rateLimit = await checkRateLimit({
    key: "profile-update",
    window: 3600, // 1 hour
    max: 10, // 10 updates per hour
    userId: session?.user?.id,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: tProfile("rateLimit", { message: rateLimit.message || "" }),
    };
  }

  // Validate values
  const validatedFields = ProfileSchema.safeParse(values);
  if (!validatedFields.success) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("validation") };
  }

  try {
    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
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
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("updateError") };
  }
}

export async function deleteUploadedFile(fileUrl: string) {
  const tProfile = await getTranslations("Errors.profile");

  // Get session first to use userId for rate limiting (prevents IP spoofing)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("unauthenticated") };
  }

  const rateLimit = await checkRateLimit({
    key: "file-delete",
    window: 3600, // 1 hour
    max: 20, // 20 deletions per hour
    userId: session.user.id,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: tProfile("rateLimit", { message: rateLimit.message || "" }),
    };
  }

  try {
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
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("deleteFileError") };
  }
}

export async function getUserSessions() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
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
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("fetchSessionsError") };
  }
}

export async function revokeSession(sessionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
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
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("revokeSessionError") };
  }
}

export async function checkUserHasPassword() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    // Check if any account has a password set
    const hasPassword = user?.accounts.some((a: any) => !!a.password);

    return { success: true, hasPassword };
  } catch (error) {
    console.error("Check password error:", error);
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("checkPasswordError") };
  }
}

export async function setUserPassword(password: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
    }

    // Safety check for method existence
    if (!(auth.api as any).setPassword) {
      console.error("auth.api.setPassword is not available");
      return {
        success: false,
        error: "System configuration error: Password setting not available",
      };
    }

    await (auth.api as any).setPassword({
      body: {
        newPassword: password,
      },
      headers: await headers(),
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Set password error:", error);
    const t = await getTranslations("Errors.profile");
    return {
      success: false,
      error:
        error.message?.body?.message || error.message || t("setPasswordError"),
    };
  }
}

export async function getUserAccounts() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
    }

    const accounts = await db.account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        providerId: true,
        createdAt: true,
      },
    });

    return { success: true, data: accounts };
  } catch (error) {
    console.error("Get accounts error:", error);
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("fetchAccountsError") };
  }
}

export async function deleteUserAccount() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { success: false, error: t("unauthenticated") };
    }

    const userId = session.user.id;

    // 1. Delete image from UploadThing if it exists
    if (session.user.image && session.user.image.includes("utfs.io")) {
      try {
        const fileKey = session.user.image.split("/f/")[1];
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      } catch (error) {
        console.warn("Could not delete profile image from UploadThing:", error);
      }
    }

    // 2. Delete the user
    // Cascading is handled by DB: Session, Account, Address, Wishlist
    // Orders will be set to NULL due to onDelete: SetNull (schema update)
    await db.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    const t = await getTranslations("Errors.profile");
    return { success: false, error: t("deleteAccountError") };
  }
}
