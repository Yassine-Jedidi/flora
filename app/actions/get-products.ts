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
      originalPrice: product.originalPrice.toNumber(),
      discountedPrice: product.discountedPrice?.toNumber() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductsByCategory(categorySlug: string, sort?: string) {
  try {
    let orderBy: any = { createdAt: "desc" };

    if (sort === "popular") {
      orderBy = [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ];
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "price") {
      orderBy = { originalPrice: "asc" };
    }

    const products = await prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
        isArchived: false,
      },
      include: {
        category: true,
        images: true,
      },
      orderBy,
    });

    return products.map((product) => ({
      ...product,
      originalPrice: product.originalPrice.toNumber(),
      discountedPrice: product.discountedPrice?.toNumber() ?? null,
    }));
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return [];
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) return null;

    return {
      ...product,
      originalPrice: product.originalPrice.toNumber(),
      discountedPrice: product.discountedPrice?.toNumber() ?? null,
    };
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        isArchived: false,
      },
      include: {
        category: true,
        images: true,
      },
      take: 5,
    });

    return products.map((product) => ({
      ...product,
      originalPrice: product.originalPrice.toNumber(),
      discountedPrice: product.discountedPrice?.toNumber() ?? null,
    }));
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
