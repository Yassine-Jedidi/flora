"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { Footer } from "@/components/footer";
import { PaginationControl } from "@/components/ui/pagination-control";

const ITEMS_PER_PAGE = 9;

export default function FavoritesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { favorites } = useFavorites();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);

  // Automatically redirect to previous page if current page becomes empty
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", totalPages.toString());
      router.replace(`?${params.toString()}`);
    }
  }, [currentPage, totalPages, router, searchParams]);

  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex flex-col">
      <div className="flex-1 pb-24">
        {/* Decorative Header */}
        <div className="relative pt-28 md:pt-40 pb-12 md:pb-20 overflow-hidden">
          {/* Pattern Background */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Floating Elements (Hidden on mobile for clarity) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] w-8 h-8 bg-pink-200/40 rotate-12 rounded-lg animate-pulse" />
          <div className="hidden md:block absolute top-1/4 right-[15%] w-6 h-6 bg-purple-200/40 rounded-full animate-bounce" />
          <div className="hidden md:block absolute bottom-10 left-[20%] w-4 h-4 bg-yellow-200/40 rotate-45 animate-pulse" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <button
                onClick={() => router.back()}
                className="mb-6 md:mb-8 flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-white/80 backdrop-blur-md text-flora-purple font-bold text-xs md:text-sm shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border border-pink-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </button>

              <div className="relative inline-block">
                <h1 className="text-4xl md:text-7xl font-black text-flora-dark tracking-tight">
                  Your <span className="text-primary">Treasures</span>
                </h1>
              </div>

              <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-500 font-medium max-w-lg px-4">
                {favorites.length === 0
                  ? "Your jewelry box is waiting to be filled with sparkles."
                  : `You've saved ${favorites.length} piece${favorites.length === 1 ? "" : "s"} that caught your eye.`}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-pink-100 shadow-xl text-center px-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-pink-50 flex items-center justify-center mb-6 md:mb-8 relative">
                <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary fill-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-flora-dark mb-3 md:mb-4">
                Your box is empty!
              </h2>
              <p className="text-gray-500 max-w-sm mb-8 md:mb-10 text-base md:text-lg leading-relaxed">
                Find pieces you love and tap the heart to save them here. They&apos;ll be waiting for you!
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-[#FF75AA] text-white rounded-full font-black px-8 py-4 md:px-12 md:h-16 text-lg md:text-xl shadow-lg hover:shadow-pink-200 transition-all hover:scale-105 active:scale-95">
                  Start Exploring
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {paginatedFavorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <PaginationControl
                total={favorites.length}
                totalPages={totalPages}
                currentPage={currentPage}
                showSinglePage={true}
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

