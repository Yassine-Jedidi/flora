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
