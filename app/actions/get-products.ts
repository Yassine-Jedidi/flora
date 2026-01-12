"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

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
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductsByCategory(categorySlug: string, sort?: string) {
  try {
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };

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
      discountedPrice: product.discountedPrice?.toNumber() ?? null,      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,    }));
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
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
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
      discountedPrice: product.discountedPrice?.toNumber() ?? null,      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,    }));
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getCategoryImages() {
  const categories = ["rings", "bracelets", "necklaces", "earrings"];
  const images: Record<string, string> = {};

  for (const slug of categories) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          category: { slug },
          isArchived: false,
          images: { some: {} }
        },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
      });
      
      if (product?.images[0]) {
        images[slug] = product.images[0].url;
      }
    } catch (e) {
      console.error(`Error fetching image for ${slug}`, e);
    }
  }
  
  return images;
}
