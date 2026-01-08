"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { Footer } from "@/components/footer";

export default function FavoritesContent() {
  const router = useRouter();
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-[#FFF5F8] pb-24">
      {/* Decorative Header */}
      <div className="relative pt-40 pb-20 overflow-hidden">
        {/* Pattern Background */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(#FF8BBA 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating Elements */}
        <div className="absolute top-1/2 left-[10%] w-8 h-8 bg-pink-200/40 rotate-12 rounded-lg animate-pulse" />
        <div className="absolute top-1/4 right-[15%] w-6 h-6 bg-purple-200/40 rounded-full animate-bounce" />
        <div className="absolute bottom-10 left-[20%] w-4 h-4 bg-yellow-200/40 rotate-45 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => router.back()}
              className="mb-8 flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md text-[#A78BFA] font-bold text-sm shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border border-pink-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>

            <div className="relative inline-block">
              <h1 className="text-5xl md:text-7xl font-black text-[#003366] tracking-tight">
                Your <span className="text-[#FF8BBA]">Treasures</span>
              </h1>
            </div>
            
            <p className="mt-6 text-lg text-gray-500 font-medium max-w-lg">
              {favorites.length === 0
                ? "Your jewelry box is waiting to be filled with sparkles."
                : `You've saved ${favorites.length} piece${favorites.length === 1 ? "" : "s"} that caught your eye.`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-pink-100 shadow-xl text-center px-4">
            <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center mb-8 relative">
              <Heart className="w-16 h-16 text-[#FF8BBA] fill-[#FF8BBA]" />
            </div>
            <h2 className="text-3xl font-black text-[#003366] mb-4">
              Your box is empty!
            </h2>
            <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed">
              Find pieces you love and tap the heart to save them here. They&apos;ll be waiting for you!
            </p>
            <Link href="/">
              <Button className="bg-[#FF8BBA] hover:bg-[#FF75AA] text-white rounded-full font-black px-12 h-16 text-xl shadow-lg hover:shadow-pink-200 transition-all hover:scale-105 active:scale-95">
                Start Exploring
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}
