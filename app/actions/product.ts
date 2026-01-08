"use server";

import prisma from "@/lib/db";
import { ProductSchema, ProductFormValues } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export async function createProduct(values: ProductFormValues) {
  try {
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { 
      name, 
      description, 
      originalPrice,
      discountedPrice, 
      categoryId, 
      stock, 
      images, 
      isFeatured, 
      isArchived 
    } = validatedFields.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        originalPrice,
        discountedPrice,
        stock,
        isFeatured,
        isArchived,
        categoryId,
        images: {
          createMany: {
            data: images.map((url) => ({ url })),
          },
        },
      },
    });

    revalidatePath("/admin/products");
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
  const categories = [
    { name: "Rings", slug: "rings" },
    { name: "Bracelets", slug: "bracelets" },
    { name: "Necklaces", slug: "necklaces" },
    { name: "Earrings", slug: "earrings" },
  ];

  const categoryNames = categories.map(c => c.name);

  // 1. Delete categories that are no longer needed
  await prisma.category.deleteMany({
    where: {
      name: {
        notIn: categoryNames,
      },
    },
  });

  // 2. Upsert the correct ones
  for (const cat of categories) {
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

    // 3. Delete from UploadThing storage
    if (fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys);
    }

    // 4. Delete from database (Prisma handles ProductImage deletion via Cascade)
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: "Product and its images deleted successfully! ✨" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Something went wrong!" };
  }
}
export async function updateProduct(id: string, values: ProductFormValues) {
  try {
    const validatedFields = ProductSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { 
      name, 
      description, 
      originalPrice,
      discountedPrice, 
      categoryId, 
      stock, 
      images, 
      isFeatured, 
      isArchived 
    } = validatedFields.data;

    // We do a transaction to ensure everything updates correctly
    await prisma.$transaction(async (tx) => {
      // 1. Update basic product info
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          originalPrice,
          discountedPrice,
          stock,
          isFeatured,
          isArchived,
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

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: "Product updated successfully! ✨" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Something went wrong!" };
  }
}
