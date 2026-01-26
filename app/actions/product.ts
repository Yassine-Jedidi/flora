"use server";

import prisma from "@/lib/db";
import { ProductSchema, ProductFormValues } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export async function createProduct(values: ProductFormValues) {
  try {
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error("Create Product - Validation error:", validatedFields.error.flatten().fieldErrors);
      return { error: "Invalid fields! " + Object.keys(validatedFields.error.flatten().fieldErrors).join(", ") };
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
      isLive
    } = validatedFields.data;

    // Manual refinement check
    if (rawOriginalPrice && rawDiscountedPrice && rawOriginalPrice <= rawDiscountedPrice) {
      return { error: "Lowered price (Sale Price) must be less than the Original Price. If there is no discount, leave Original Price empty." };
    }

    // Logic for optional discount:
    // If originalPrice is empty or 0, then the sale price is the actual original price, and there's no discount record.
    const finalOriginalPrice = rawOriginalPrice && rawOriginalPrice > 0 
      ? rawOriginalPrice 
      : rawDiscountedPrice;
    
    const finalDiscountedPrice = (rawOriginalPrice && rawOriginalPrice > 0 && rawOriginalPrice > rawDiscountedPrice)
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
    revalidatePath("/"); // Revalidate home page if products are shown there

    return { success: "Product created successfully!", productId: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Something went wrong!" };
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
    // 1. Find the product and its images first
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!product) {
      return { error: "Product not found" };
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
      await utapi.deleteFiles(fileKeys);
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    
    return { success: "Product and its images deleted successfully! ✨" };
  } catch (error: any) {
    // Check for Prisma "Foreign Key Constraint" error (P2003)
    // This happens when the product is linked to Orders or other tables that restrict deletion
    if (error.code === 'P2003') {
      return { error: "Cannot delete product with existing Orders. It must remain Archived to preserve sales history." };
    }

    console.error("Error deleting product:", error);
    return { error: "Something went wrong!" };
  }
}
export async function updateProduct(id: string, values: ProductFormValues) {
  try {
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      console.error("Update Product - Validation error:", validatedFields.error.flatten().fieldErrors);
      return { error: "Invalid fields! " + Object.keys(validatedFields.error.flatten().fieldErrors).join(", ") };
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
      isLive
    } = validatedFields.data;

    // Manual refinement check
    if (rawOriginalPrice && rawDiscountedPrice && rawOriginalPrice <= rawDiscountedPrice) {
      return { error: "Lowered price (Sale Price) must be less than the Original Price. If there is no discount, leave Original Price empty." };
    }

    // Logic for optional discount:
    const finalOriginalPrice = rawOriginalPrice && rawOriginalPrice > 0 
      ? rawOriginalPrice 
      : rawDiscountedPrice;
    
    const finalDiscountedPrice = (rawOriginalPrice && rawOriginalPrice > 0 && rawOriginalPrice > rawDiscountedPrice)
      ? rawDiscountedPrice 
      : null;

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
      // Note: We don't delete from UploadThing here as some images might still be in use
      // A more robust app would compare and delete unused ones from UT
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

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    
    return { success: "Product updated successfully! ✨" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Something went wrong!" };
  }
}
