"use server";

import prisma from "@/lib/db";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to number for Client Component serialization
    return products.map((product) => ({
      ...product,
      price: product.price.toNumber(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
