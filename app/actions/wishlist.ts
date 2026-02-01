"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getWishlist() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const wishlist = await db.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: wishlist.map((item) => ({
        ...item.product,
        originalPrice: item.product.originalPrice.toNumber(),
        discountedPrice: item.product.discountedPrice
          ? item.product.discountedPrice.toNumber()
          : null,
      })),
    };
  } catch (error) {
    console.error("[GET_WISHLIST]", error);
    return { success: false, error: "Failed to fetch wishlist" };
  }
}

export async function toggleWishlistProduct(productId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const existingItem = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await db.wishlist.delete({
        where: {
          id: existingItem.id,
        },
      });
      revalidatePath("/profile");
      return { success: true, action: "removed" };
    } else {
      // Use transaction to atomically check count and create to prevent race conditions
      const result = await db.$transaction(async (tx) => {
        // Check limit within transaction
        const count = await tx.wishlist.count({
          where: {
            userId: session.user.id,
          },
        });

        if (count >= 20) {
          throw new Error(
            "Wishlist limit reached. You can only save up to 20 items.",
          );
        }

        // Create wishlist item within same transaction
        await tx.wishlist.create({
          data: {
            userId: session.user.id,
            productId,
          },
        });

        return { success: true, action: "added" };
      });

      revalidatePath("/profile");
      return result;
    }
  } catch (error) {
    console.error("[TOGGLE_WISHLIST]", error);

    // Check if it's our custom limit error
    if (
      error instanceof Error &&
      error.message.includes("Wishlist limit reached")
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: false, error: "Failed to update wishlist" };
  }
}

export async function syncWishlist(productIds: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get current count
    const currentCount = await db.wishlist.count({
      where: {
        userId: session.user.id,
      },
    });

    const remainingSlots = 20 - currentCount;
    if (remainingSlots <= 0) {
      return {
        success: true,
        message: "Wishlist full, sync skipped for some items",
      };
    }

    const idsToSync = productIds.slice(0, remainingSlots);

    for (const productId of idsToSync) {
      // Upsert to avoid duplicates and errors
      const exists = await db.wishlist.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });

      if (!exists) {
        await db.wishlist.create({
          data: {
            userId: session.user.id,
            productId,
          },
        });
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[SYNC_WISHLIST]", error);
    return { success: false, error: "Failed to sync wishlist" };
  }
}
