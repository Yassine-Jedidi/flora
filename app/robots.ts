import type { MetadataRoute } from "next";

const BASE_URL = "https://www.floraaccess.tn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/profile/",
          "/orders/",
          "/favorites/",
          "/signin/",
          "/signup/",
          "/forgot-password/",
          "/reset-password/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
