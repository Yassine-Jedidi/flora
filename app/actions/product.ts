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
      price, 
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
        price,
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
    { name: "Hair Accessories", slug: "hair-accessories" },
    { name: "Jewelry", slug: "jewelry" },
    { name: "Bags", slug: "bags" },
    { name: "Stickers & Stationery", slug: "stationery" },
  ];

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
