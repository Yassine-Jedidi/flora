import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import FavoritesContent from "@/components/favorites/favorites-content";

export async function generateMetadata() {
  const t = await getTranslations("Metadata.favorites");
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/favorites",
      languages: {
        "fr-TN": "/favorites",
        "en-TN": "/favorites",
        "x-default": "/favorites",
      },
    }
  };
}

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <FavoritesContent />
    </>
  );
}
