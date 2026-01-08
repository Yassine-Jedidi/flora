"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";

const FavoritesContent = dynamic(
  () => import("@/components/favorites/favorites-content"),
  { ssr: false }
);

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <FavoritesContent />
    </>
  );
}
