import { getTranslations } from "next-intl/server";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";

const FavoritesContent = dynamic(
  () => import("@/components/favorites/favorites-content"),
  { ssr: false }
);

export async function generateMetadata() {
  const t = await getTranslations("Metadata.favorites");
  return {
    title: t("title"),
    description: t("description")
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
