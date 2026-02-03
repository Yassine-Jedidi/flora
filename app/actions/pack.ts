"use server";

import prisma from "@/lib/db";
import { PackSchema, PackFormValues } from "@/lib/validations/pack";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export async function createPack(values: PackFormValues) {
  try {
    const t = await getTranslations("Errors");
    const tPack = await getTranslations("Admin.packForm");
    const validatedFields = PackSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error(
        "Create Pack - Validation error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        error:
          t("validation") +
          " " +
          Object.keys(validatedFields.error.flatten().fieldErrors).join(", "),
      };
    }

    const {
      name,
      description,
      originalPrice: rawOriginalPrice,
      discountedPrice: rawDiscountedPrice,
      categoryId,
      stock,
      images,
      isFeatured,
      isArchived,
      isLive,
      packItems,
    } = validatedFields.data;

    // Manual refinement check
    if (
      rawOriginalPrice &&
      rawDiscountedPrice &&
      rawOriginalPrice <= rawDiscountedPrice
    ) {
      return {
        error: t("priceRefinement"),
      };
    }

    // Logic for optional discount
    const finalOriginalPrice =
      rawOriginalPrice && rawOriginalPrice > 0
        ? rawOriginalPrice
        : rawDiscountedPrice;

    const finalDiscountedPrice =
      rawOriginalPrice &&
      rawOriginalPrice > 0 &&
      rawOriginalPrice > rawDiscountedPrice
        ? rawDiscountedPrice
        : null;

    // Verify all items exist
    const itemIds = packItems.map((item) => item.itemId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: itemIds } },
      select: { id: true },
    });

    if (existingProducts.length !== itemIds.length) {
      return { error: t("itemsNotFound") };
    }

    if (!categoryId) {
      return { error: t("categoryRequired") };
    }

    // Create the pack with its items
    const pack = await prisma.product.create({
      data: {
        name,
        description,
        originalPrice: finalOriginalPrice,
        discountedPrice: finalDiscountedPrice,
        stock: stock || 0,
        isFeatured,
        isArchived,
        isLive,
        categoryId: categoryId,
        images: {
          createMany: {
            data: (images || []).map((url) => ({ url })),
          },
        },
        packItems: {
          create: packItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/"); // Revalidate home page if products are shown there

    return { success: tPack("toasts.successCreate"), packId: pack.id };
  } catch (error) {
    console.error("Error creating pack:", error);
    const t = await getTranslations("Errors");
    return { error: t("generic") };
  }
}

export async function updatePack(id: string, values: PackFormValues) {
  try {
    const t = await getTranslations("Errors");
    const tPack = await getTranslations("Admin.packForm");
    const validatedFields = PackSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error(
        "Update Pack - Validation error:",
        validatedFields.error.flatten().fieldErrors,
      );
      return {
        error:
          t("validation") +
          " " +
          Object.keys(validatedFields.error.flatten().fieldErrors).join(", "),
      };
    }

    const {
      name,
      description,
      originalPrice: rawOriginalPrice,
      discountedPrice: rawDiscountedPrice,
      categoryId,
      stock,
      images,
      isFeatured,
      isArchived,
      isLive,
      packItems,
    } = validatedFields.data;

    // Manual refinement check
    if (
      rawOriginalPrice &&
      rawDiscountedPrice &&
      rawOriginalPrice <= rawDiscountedPrice
    ) {
      return {
        error: t("priceRefinement"),
      };
    }

    // Logic for optional discount
    const finalOriginalPrice =
      rawOriginalPrice && rawOriginalPrice > 0
        ? rawOriginalPrice
        : rawDiscountedPrice;

    const finalDiscountedPrice =
      rawOriginalPrice &&
      rawOriginalPrice > 0 &&
      rawOriginalPrice > rawDiscountedPrice
        ? rawDiscountedPrice
        : null;

    // Verify all items exist
    const itemIds = packItems.map((item) => item.itemId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: itemIds } },
      select: { id: true },
    });

    if (existingProducts.length !== itemIds.length) {
      return { error: t("itemsNotFound") };
    }

    if (!categoryId) {
      return { error: t("categoryRequired") };
    }

    // Update the pack with transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update basic pack info
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          originalPrice: finalOriginalPrice,
          discountedPrice: finalDiscountedPrice,
          stock: stock || 0,
          isFeatured,
          isArchived,
          isLive,
          categoryId: categoryId,
        },
      });

      // 2. Refresh images
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      await tx.productImage.createMany({
        data: (images || []).map((url) => ({
          productId: id,
          url,
        })),
      });

      // 3. Refresh pack items
      await tx.packItem.deleteMany({
        where: { packId: id },
      });

      await tx.packItem.createMany({
        data: packItems.map((item) => ({
          packId: id,
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      });
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/");

    return { success: tPack("toasts.successUpdate") };
  } catch (error) {
    console.error("Error updating pack:", error);
    const t = await getTranslations("Errors");
    return { error: t("generic") };
  }
}

export async function getAvailableProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        // Exclude packs - products that have packItems
        packItems: {
          none: {},
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        discountedPrice: true,
        originalPrice: true,
        stock: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice
        ? Number(product.discountedPrice)
        : null,
    }));
  } catch (error) {
    console.error("Error fetching available products:", error);
    return [];
  }
}
