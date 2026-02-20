import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flora Accessories - Bijoux et Accessoires de Luxe",
    short_name: "Flora Accessories",
    description:
      "Explorez notre collection exclusive de bijoux et d'accessoires de mode pour chaque occasion. Éclat, style et sophistication livrés à votre porte.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF6B9A",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
