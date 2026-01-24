"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

interface ProductFilters {
  search?: string;
  category?: string;
  status?: "all" | "live" | "paused" | "archived";
  stock?: "all" | "inStock" | "lowStock" | "outOfStock";
}

export async function getProducts(
  page: number = 1,
  pageSize: number = 10,
  filters?: ProductFilters
) {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause based on filters
    const where: Prisma.ProductWhereInput = {};

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    if (filters?.category && filters.category !== "all") {
      where.categoryId = filters.category;
    }

    if (filters?.status && filters.status !== "all") {
      if (filters.status === "live") {
        where.isLive = true;
        where.isArchived = false;
      } else if (filters.status === "paused") {
        where.isLive = false;
      } else if (filters.status === "archived") {
        where.isArchived = true;
      }
    }

    if (filters?.stock && filters.stock !== "all") {
      if (filters.stock === "inStock") {
        where.stock = { gt: 5 };
      } else if (filters.stock === "lowStock") {
        where.stock = { gt: 0, lte: 5 };
      } else if (filters.stock === "outOfStock") {
        where.stock = 0;
      }
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          _count: {
            select: { packItems: true }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize,
        skip: skip,
      }),
    ]);

    // Convert Decimal to number for Client Component serialization
    const mappedProducts = products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));

    return {
      products: mappedProducts,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllProducts() {
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
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductsByCategory(
  categorySlug: string,
  sort?: string,
  filterCategory?: string,
  page: number = 1,
  pageSize: number = 12
) {
  try {
    const skip = (page - 1) * pageSize;
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };

    if (sort === "popular") {
      orderBy = [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ];
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "price-asc" || sort === "price") {
      orderBy = { originalPrice: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { originalPrice: "desc" };
    }

    const where: Prisma.ProductWhereInput = {
      isArchived: false,
      isLive: true,
    };

    if (categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    } else if (filterCategory && filterCategory !== "all") {
      // If viewing "all" but filtered by a sub-category
      where.category = {
        slug: filterCategory,
      };
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
        },
        orderBy,
        take: pageSize,
        skip,
      }),
    ]);

    const mappedProducts = products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));

    return {
      products: mappedProducts,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
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
        packItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      packItems: product.packItems.map(pi => ({
        ...pi,
        item: {
          ...pi.item,
          originalPrice: Number(pi.item.originalPrice),
          discountedPrice: pi.item.discountedPrice ? Number(pi.item.discountedPrice) : null,
          createdAt: pi.item.createdAt.toISOString(),
          updatedAt: pi.item.updatedAt.toISOString(),
        }
      }))
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
        isLive: true,
      },
      include: {
        category: true,
        images: true,
      },
      take: 5,
    });

    return products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isArchived: false,
        isLive: true,
      },
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    return products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
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
          isLive: true,
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

export async function getSaleProducts(
  sort?: string,
  categorySlug?: string,
  page: number = 1,
  pageSize: number = 12
) {
  try {
    const skip = (page - 1) * pageSize;
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };

    if (sort === "popular") {
      orderBy = [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ];
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "price-asc" || sort === "price") {
      orderBy = { originalPrice: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { originalPrice: "desc" };
    }

    const where: Prisma.ProductWhereInput = {
      discountedPrice: {
        not: null,
      },
      isArchived: false,
      isLive: true,
    };

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    // We need to fetch and filter in memory for complex price comparisons not easily doable in Prisma where clause directly across DBs (discount < original)
    // However, for pagination efficiency, we should try to do it in DB if possible.
    // Assuming discountedPrice is always < originalPrice if it is set in business logic, we trust the 'discountedPrice: { not: null }' check.
    // If strict check is needed: WHERE discountedPrice < originalPrice. Prisma doesn't support field comparison in where easily without raw query.
    // We will stick to fetching based on discountedPrice existence for now to support pagination efficiently.
    
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
        },
        orderBy,
        take: pageSize,
        skip,
      }),
    ]);

    const mappedProducts = products.map((product) => ({
      ...product,
      originalPrice: Number(product.originalPrice),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      isNew:
        new Date(product.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000,
    }));

     // Filter ensuring discount is valid (though this happens after pagination which is slightly inaccurate for total count if data is bad, but generally safe)
    const validSaleProducts = mappedProducts.filter(p => p.discountedPrice !== null && p.discountedPrice < p.originalPrice);

    // If filtering removed items, the page size might be smaller than requested. 
    // Ideally we clean data or use raw query, but for now this is acceptable.

    return {
      products: validSaleProducts,
      total, // Approximate total based on DB query
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}
