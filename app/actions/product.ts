"use server";

import prisma from "@/lib/db";
import { ProductSchema, ProductFormValues } from "@/lib/validations/product";
import { revalidatePath, revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createProduct(values: ProductFormValues) {
  try {
    const t = await getTranslations("Errors");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: t("unauthorized") || "Unauthorized" };
    }

    const tProduct = await getTranslations("Admin.productForm");
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error(
        "Create Product - Validation error:",
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
    } = validatedFields.data;

    // Manual refinement check
    if (
      rawOriginalPrice &&
      rawDiscountedPrice &&
      rawOriginalPrice <= rawDiscountedPrice
    ) {
      return {
        error:
          "Lowered price (Sale Price) must be less than the Original Price. If there is no discount, leave Original Price empty.",
      };
    }

    // Logic for optional discount:
    // If originalPrice is empty or 0, then the sale price is the actual original price, and there's no discount record.
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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        originalPrice: finalOriginalPrice,
        discountedPrice: finalDiscountedPrice,
        stock,
        isFeatured,
        isArchived,
        isLive,
        categoryId,
        images: {
          createMany: {
            data: images.map((url) => ({ url })),
          },
        },
      },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    revalidateTag("category-images", "max");

    return { success: tProduct("toasts.successCreate"), productId: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    const t = await getTranslations("Errors");
    return { error: t("generic") };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Temporary debug action to create initial categories
export async function seedCategories() {
  const defaultCategories = [
    { name: "Rings", slug: "rings" },
    { name: "Bracelets", slug: "bracelets" },
    { name: "Necklaces", slug: "necklaces" },
    { name: "Earrings", slug: "earrings" },
    { name: "Packs", slug: "packs" },
  ];

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { error: t("unauthorized") };
  }

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
}
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteProduct(id: string) {
  try {
    const t = await getTranslations("Errors");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: t("unauthorized") || "Unauthorized" };
    }

    // 1. Find the product and its images first
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    const tProduct = await getTranslations("Admin.productForm");

    if (!product) {
      return { error: t("notFound") };
    }

    // 2. Extract file keys from UploadThing URLs
    // UploadThing URLs are typically https://utfs.io/f/KEY or https://img.utfs.io/KEY
    const fileKeys = product.images.map((img) => {
      const urlParts = img.url.split("/");
      return urlParts[urlParts.length - 1];
    });

    // 3. Delete from database FIRST (Prisma handles ProductImage deletion via Cascade)
    // We do this first so if it fails, we don't end up with broken images (ghost records)
    await prisma.product.delete({
      where: { id },
    });

    // 4. Delete from UploadThing storage
    // If this fails, we just have orphaned files (which is better than broken UI)
    if (fileKeys.length > 0) {
      try {
        await utapi.deleteFiles(fileKeys);
      } catch (utError) {
        console.error("Failed to delete files from UploadThing:", utError);
      }
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    revalidateTag("category-images", "max");
    revalidateTag(`product-${id}`, "max");

    return { success: tProduct("toasts.successDelete") };
  } catch (error) {
    const t = await getTranslations("Errors");
    if (
      error instanceof Error &&
      (error as { code?: unknown }).code === "P2003"
    ) {
      return {
        error: t("deleteRestricted"),
      };
    }

    console.error("Error deleting product:", error);
    return { error: t("generic") };
  }
}
export async function updateProduct(id: string, values: ProductFormValues) {
  try {
    const t = await getTranslations("Errors");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: t("unauthorized") || "Unauthorized" };
    }

    const tProduct = await getTranslations("Admin.productForm");
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error(
        "Update Product - Validation error:",
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

    // Logic for optional discount:
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

    if (!categoryId) {
      return { error: t("categoryRequired") };
    }

    // 0. Get current images for cleanup
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    const currentImages = currentProduct?.images.map((img) => img.url) || [];
    const removedImages = currentImages.filter((url) => !images.includes(url));

    // We do a transaction to ensure everything updates correctly
    await prisma.$transaction(async (tx) => {
      // 1. Update basic product info
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          originalPrice: finalOriginalPrice,
          discountedPrice: finalDiscountedPrice,
          stock,
          isFeatured,
          isArchived,
          isLive,
          categoryId,
        },
      });

      // 2. Refresh images (simplest approach: delete and recreate references)
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      await tx.productImage.createMany({
        data: images.map((url) => ({
          productId: id,
          url,
        })),
      });
    });

    // Cleanup orphaned images from UploadThing
    if (removedImages.length > 0) {
      const fileKeys = removedImages
        .map((url) => url.split("/").pop())
        .filter(Boolean) as string[];
      if (fileKeys.length > 0) {
        try {
          await utapi.deleteFiles(fileKeys);
        } catch (utError) {
          console.error(
            "Failed to delete removed files from UploadThing:",
            utError,
          );
        }
      }
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    revalidateTag("category-images", "max");
    revalidateTag(`product-${id}`, "max");

    return { success: tProduct("toasts.successUpdate") };
  } catch (error) {
    console.error("Error updating product:", error);
    const t = await getTranslations("Errors");
    return { error: t("generic") };
  }
}

export async function deleteProductImage(url: string) {
  try {
    const t = await getTranslations("Errors");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { error: t("unauthorized") || "Unauthorized" };
    const fileKey = url.split("/").pop();
    if (!fileKey) return { error: "Invalid URL" };

    // utapi is defined globally in this file (lines 107)
    await utapi.deleteFiles(fileKey);
    return { success: true };
  } catch (error) {
    console.error("Error deleting image file:", error);
    return { error: "Failed to delete image file" };
  }
}
