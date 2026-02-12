"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Product } from "@/lib/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { cache } from "react";

interface ProductFilters {
  search?: string;
  category?: string;
  status?: "all" | "live" | "paused" | "archived";
  stock?: "all" | "inStock" | "lowStock" | "outOfStock";
}

import { unstable_cache } from "next/cache";

export const getProducts = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: ProductFilters,
) => {
  return unstable_cache(
    async () => {
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
                select: { packItems: true },
              },
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
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
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
    },
    [`products-${page}-${pageSize}-${JSON.stringify(filters)}`],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ["products"],
    },
  )();
};

export const getCategories = cache(async () => {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

export const getAllProducts = cache(async () => {
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
      discountedPrice: product.discountedPrice
        ? Number(product.discountedPrice)
        : null,
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
});

export const getProductsByCategory = cache(
  async (
    categorySlug: string,
    sort?: string,
    filterCategory?: string,
    page: number = 1,
    pageSize: number = 12,
  ) => {
    try {
      const skip = (page - 1) * pageSize;

      // We'll build the base WHERE clause for Prisma
      const where: Prisma.ProductWhereInput = {
        isArchived: false,
        isLive: true,
      };

      if (categorySlug !== "all") {
        where.category = {
          slug: categorySlug,
        };
      } else if (filterCategory && filterCategory !== "all") {
        where.category = {
          slug: filterCategory,
        };
      }

      // Determine the ORDER BY clause for Prisma or manual sort
      let orderBy:
        | Prisma.ProductOrderByWithRelationInput
        | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };

      // If sorting by price, we need to handle the effective price (discounted or original)
      // Since Prisma findMany doesn't support sorting by a calculated field like COALESCE(discountedPrice, originalPrice),
      // we have two options: Raw query or fetch IDs first. Raw query is most efficient for pagination.
      if (sort === "price-asc" || sort === "price" || sort === "price-desc") {
        const direction = sort === "price-desc" ? "DESC" : "ASC";
        const categoryFilter =
          categorySlug !== "all"
            ? categorySlug
            : filterCategory && filterCategory !== "all"
              ? filterCategory
              : null;

        // Get IDs using raw SQL to handle the COALESCE sorting across the entire table
        const orderedProducts: { id: string }[] = await prisma.$queryRaw`
        SELECT p.id 
        FROM "Product" p
        ${
          categoryFilter
            ? Prisma.sql`
          JOIN "Category" c ON p."categoryId" = c.id 
          WHERE c.slug = ${categoryFilter} AND p."isArchived" = false AND p."isLive" = true
        `
            : Prisma.sql`
          WHERE p."isArchived" = false AND p."isLive" = true
        `
        }
        ORDER BY COALESCE(p."discountedPrice", p."originalPrice") ${Prisma.raw(direction)}
        LIMIT ${pageSize} OFFSET ${skip}
      `;

        const ids = orderedProducts.map((p) => p.id);

        // Now fetch full product details for these IDs, maintaining the order
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          include: {
            category: true,
            images: true,
          },
        });

        // Prisma's IN operator doesn't preserve order, so we re-sort them based on the ID order from raw query
        const sortedProducts = ids
          .map((id) => products.find((p) => p.id === id)!)
          .filter(Boolean);
        const total = await prisma.product.count({ where });

        const mappedProducts = sortedProducts.map((product) => ({
          ...product,
          originalPrice: Number(product.originalPrice),
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
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
      }

      // Default Prisma logic for non-price sorts
      if (sort === "popular") {
        orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
      } else if (sort === "newest") {
        orderBy = { createdAt: "desc" };
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
        discountedPrice: product.discountedPrice
          ? Number(product.discountedPrice)
          : null,
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
      console.error(
        `Error fetching products for category ${categorySlug}:`,
        error,
      );
      return { products: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  },
);

export const getRelatedProducts = cache(
  async (categoryId: string, excludeProductId: string): Promise<Product[]> => {
    try {
      const products = await prisma.product.findMany({
        where: {
          categoryId,
          id: { not: excludeProductId },
          isArchived: false,
          isLive: true,
        },
        select: {
          id: true,
          name: true,
          originalPrice: true,
          discountedPrice: true,
          stock: true,
          isFeatured: true,
          isArchived: true,
          isLive: true,
          categoryId: true,
          description: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            take: 1,
            select: {
              id: true,
              url: true,
            },
          },
          createdAt: true,
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      });

      return products.map((product) => ({
        ...product,
        originalPrice: Number(product.originalPrice),
        discountedPrice: product.discountedPrice
          ? Number(product.discountedPrice)
          : null,
        createdAt: product.createdAt.toISOString(),
        isNew:
          new Date(product.createdAt).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000,
      }));
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  },
);

export const getProduct = async (id: string): Promise<Product | null> => {
  return unstable_cache(
    async () => {
      try {
        const product = await prisma.product.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            description: true,
            originalPrice: true,
            discountedPrice: true,
            stock: true,
            isFeatured: true,
            isArchived: true,
            isLive: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
              },
            },
            createdAt: true,
            packItems: {
              select: {
                id: true,
                quantity: true,
                item: {
                  select: {
                    id: true,
                    name: true,
                    originalPrice: true,
                    discountedPrice: true,
                    categoryId: true,
                    category: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    images: {
                      take: 1,
                      select: {
                        id: true,
                        url: true,
                      },
                    },
                    description: true,
                    stock: true,
                    isFeatured: true,
                    isArchived: true,
                    isLive: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        });

        if (!product) return null;

        // Convert Decimal to number for Client Component serialization
        const mappedProduct = {
          ...product,
          originalPrice: Number(product.originalPrice),
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
          createdAt: product.createdAt.toISOString(),
          isNew:
            new Date(product.createdAt).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          packItems: product.packItems.map((pi) => ({
            ...pi,
            itemId: pi.item.id,
            item: {
              ...pi.item,
              originalPrice: Number(pi.item.originalPrice),
              discountedPrice: pi.item.discountedPrice
                ? Number(pi.item.discountedPrice)
                : null,
            },
          })),
        };

        return mappedProduct;
      } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
      }
    },
    [`product-${id}`],
    {
      revalidate: 3600,
      tags: [`product-${id}`],
    },
  )();
};

export const searchProducts = cache(
  async (
    query: string,
    limit: number = 5,
  ): Promise<
    { success: true; data: Product[] } | { success: false; error: string }
  > => {
    if (!query || query.length < 2) return { success: true, data: [] };

    // Get session for authenticated rate limiting (prevents IP spoofing)
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const rateLimit = await checkRateLimit({
      key: "product-search",
      window: 60,
      max: 30,
      userId: session?.user?.id,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: `Too many searches. Please try again in ${rateLimit.message}.`,
      };
    }

    try {
      const normalizedQuery = query.toLowerCase().trim();
      const singularQuery = normalizedQuery.endsWith("s")
        ? normalizedQuery.slice(0, -1)
        : normalizedQuery;

      // Fetch a larger pool of potential matches to rank them in memory
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { description: { contains: normalizedQuery, mode: "insensitive" } },
            {
              category: {
                name: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
            {
              category: {
                slug: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
          ],
          isArchived: false,
          isLive: true,
        },
        include: {
          category: true,
          images: true,
        },
        take: Math.max(20, limit * 2), // Pool size for ranking
      });

      const scoredProducts = products.map((product) => {
        let score = 0;
        const name = product.name.toLowerCase();
        const description = product.description.toLowerCase();
        const categoryName = product.category.name.toLowerCase();
        const categorySlug = product.category.slug.toLowerCase();

        // 1. Category matches (High priority)
        if (
          categoryName === normalizedQuery ||
          categorySlug === normalizedQuery ||
          categoryName === singularQuery ||
          categorySlug === singularQuery
        ) {
          score += 100;
        }

        // 2. Exact name match
        if (name === normalizedQuery) {
          score += 150;
        }

        // 3. Standalone word match in name
        const nameWords = name.split(/\s+/);
        if (
          nameWords.includes(normalizedQuery) ||
          nameWords.includes(singularQuery)
        ) {
          score += 80;
        }

        // 4. Starts with match
        if (name.startsWith(normalizedQuery)) {
          score += 40;
        }

        // 5. Basic contains in name
        if (name.includes(normalizedQuery)) {
          score += 20;
        }

        // 6. Contains in description
        if (description.includes(normalizedQuery)) {
          score += 5;
        }

        // 7. Featured boost
        if (product.isFeatured) {
          score += 10;
        }

        return {
          ...product,
          searchScore: score,
          originalPrice: Number(product.originalPrice),
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
          isNew:
            new Date(product.createdAt).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000,
        };
      });

      // Sort by score descending and take requested limit
      const finalResults = scoredProducts
        .sort((a, b) => b.searchScore - a.searchScore)
        .slice(0, limit)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ searchScore, ...product }) => product);

      return { success: true, data: finalResults };
    } catch (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        error: "Something went wrong. Please try again later.",
      };
    }
  },
);

export const getFeaturedProducts = async (): Promise<Product[]> => {
  return unstable_cache(
    async () => {
      try {
        const products = await prisma.product.findMany({
          where: {
            isFeatured: true,
            isArchived: false,
            isLive: true,
          },
          select: {
            id: true,
            name: true,
            originalPrice: true,
            discountedPrice: true,
            stock: true,
            isFeatured: true,
            isArchived: true,
            isLive: true,
            categoryId: true,
            description: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              take: 1,
              select: {
                id: true,
                url: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 8,
        });

        // Convert Decimal to number for Client Component serialization
        return products.map((product) => ({
          ...product,
          originalPrice: Number(product.originalPrice),
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
          createdAt: product.createdAt.toISOString(),
          isNew:
            new Date(product.createdAt).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000,
        }));
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
    },
    ["featured-products"],
    {
      revalidate: 3600,
      tags: ["featured-products"],
    },
  )();
};

export const getCategoryImages = async () => {
  return unstable_cache(
    async () => {
      const categories = ["rings", "bracelets", "necklaces", "earrings"];
      const images: Record<string, string> = {};

      for (const slug of categories) {
        try {
          const product = await prisma.product.findFirst({
            where: {
              category: { slug },
              isArchived: false,
              isLive: true,
              images: { some: {} },
            },
            include: { images: true },
            orderBy: { createdAt: "desc" },
          });

          if (product?.images[0]) {
            images[slug] = product.images[0].url;
          }
        } catch {
          console.error(`Error fetching image for ${slug}`);
        }
      }

      return images;
    },
    ["category-images"],
    {
      revalidate: 3600,
      tags: ["category-images"],
    },
  )();
};

export const getSaleProducts = cache(
  async (
    sort?: string,
    categorySlug?: string,
    page: number = 1,
    pageSize: number = 12,
  ) => {
    try {
      const skip = (page - 1) * pageSize;
      let orderBy:
        | Prisma.ProductOrderByWithRelationInput
        | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };

      if (sort === "popular") {
        orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
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

      // Handle effective price sorting for sale items
      if (sort === "price-asc" || sort === "price" || sort === "price-desc") {
        const direction = sort === "price-desc" ? "DESC" : "ASC";

        const orderedProducts: { id: string }[] = await prisma.$queryRaw`
        SELECT p.id 
        FROM "Product" p
        ${
          categorySlug && categorySlug !== "all"
            ? Prisma.sql`
          JOIN "Category" c ON p."categoryId" = c.id 
          WHERE c.slug = ${categorySlug} AND p."discountedPrice" IS NOT NULL AND p."isArchived" = false AND p."isLive" = true
        `
            : Prisma.sql`
          WHERE p."discountedPrice" IS NOT NULL AND p."isArchived" = false AND p."isLive" = true
        `
        }
        ORDER BY COALESCE(p."discountedPrice", p."originalPrice") ${Prisma.raw(direction)}
        LIMIT ${pageSize} OFFSET ${skip}
      `;

        const ids = orderedProducts.map((p) => p.id);

        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          include: {
            category: true,
            images: true,
          },
        });

        const sortedProducts = ids
          .map((id) => products.find((p) => p.id === id)!)
          .filter(Boolean);
        const total = await prisma.product.count({ where });

        const mappedProducts = sortedProducts.map((product) => ({
          ...product,
          originalPrice: Number(product.originalPrice),
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : null,
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
        discountedPrice: product.discountedPrice
          ? Number(product.discountedPrice)
          : null,
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
      console.error("Error fetching sale products:", error);
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  },
);
