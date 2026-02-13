import type { MetadataRoute } from "next";
import db from "@/lib/db";
import { BASE_URL } from "@/lib/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          "fr-TN": BASE_URL,
          "en-TN": BASE_URL,
          "x-default": BASE_URL,
        },
      },
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/shop`,
          "en-TN": `${BASE_URL}/shop`,
          "x-default": `${BASE_URL}/shop`,
        },
      },
    },
    {
      url: `${BASE_URL}/rings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/rings`,
          "en-TN": `${BASE_URL}/rings`,
          "x-default": `${BASE_URL}/rings`,
        },
      },
    },
    {
      url: `${BASE_URL}/bracelets`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/bracelets`,
          "en-TN": `${BASE_URL}/bracelets`,
          "x-default": `${BASE_URL}/bracelets`,
        },
      },
    },
    {
      url: `${BASE_URL}/necklaces`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/necklaces`,
          "en-TN": `${BASE_URL}/necklaces`,
          "x-default": `${BASE_URL}/necklaces`,
        },
      },
    },
    {
      url: `${BASE_URL}/earrings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/earrings`,
          "en-TN": `${BASE_URL}/earrings`,
          "x-default": `${BASE_URL}/earrings`,
        },
      },
    },
    {
      url: `${BASE_URL}/packs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/packs`,
          "en-TN": `${BASE_URL}/packs`,
          "x-default": `${BASE_URL}/packs`,
        },
      },
    },
    {
      url: `${BASE_URL}/sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/sale`,
          "en-TN": `${BASE_URL}/sale`,
          "x-default": `${BASE_URL}/sale`,
        },
      },
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/faq`,
          "en-TN": `${BASE_URL}/faq`,
          "x-default": `${BASE_URL}/faq`,
        },
      },
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: {
        languages: {
          "fr-TN": `${BASE_URL}/shipping`,
          "en-TN": `${BASE_URL}/shipping`,
          "x-default": `${BASE_URL}/shipping`,
        },
      },
    },
  ];

  // Dynamic product pages — only live, non-archived products
  const products = await db.product.findMany({
    where: {
      isLive: true,
      isArchived: false,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: {
      languages: {
        "fr-TN": `${BASE_URL}/product/${product.id}`,
        "en-TN": `${BASE_URL}/product/${product.id}`,
        "x-default": `${BASE_URL}/product/${product.id}`,
      },
    },
  }));

  return [...staticPages, ...productPages];
}
