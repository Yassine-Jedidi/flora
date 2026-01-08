"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useFavorites, type FavoriteProduct } from "@/lib/hooks/use-favorites";
import { useEffect, useState } from "react";

export function FavoritesSheet() {
  const { favorites, removeFavorite } = useFavorites();
  const [isOpen, setIsOpen] = useState(false);

  const hasDiscount = (product: FavoriteProduct) =>
    product.discountedPrice && product.discountedPrice < product.originalPrice;

  const discountPercentage = (product: FavoriteProduct) =>
    hasDiscount(product)
      ? Math.round(
          ((product.originalPrice - product.discountedPrice!) /
            product.originalPrice) *
            100
        )
      : 0;

  const displayPrice = (product: FavoriteProduct) =>
    product.discountedPrice || product.originalPrice;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 text-[#003366] transition-colors group/nav-heart">
          <Heart className="w-5 h-5 text-[#FF8BBA] fill-[#FF8BBA] transition-transform group-hover/nav-heart:scale-110" />
          {favorites.length > 0 && (
            <span className="absolute top-0 right-0 bg-[#A78BFA] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm group-hover/nav-heart:-translate-y-1 transition-transform">
              {favorites.length}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-black text-[#003366]">
            ✨ Your Favorites
          </SheetTitle>
          <SheetDescription>
            {favorites.length === 0
              ? "No favorite items yet. Start adding treasures!"
              : `${favorites.length} item${
                  favorites.length > 1 ? "s" : ""
                } saved`}
          </SheetDescription>
        </SheetHeader>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-[#FF8BBA] fill-[#FF8BBA]" />
            </div>
            <p className="text-gray-500 font-semibold mb-2">No favorites yet</p>
            <p className="text-sm text-gray-400">
              Click the heart icon on products to save them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group flex gap-4 p-4 rounded-2xl border border-pink-100 hover:shadow-md transition-all bg-white"
              >
                {/* Product Image */}
                <Link href={`/product/${product.id}`} className="shrink-0">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-pink-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                    {hasDiscount(product) && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">
                        -{discountPercentage(product)}%
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-[#003366] line-clamp-2 hover:text-[#FF8BBA] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category.name}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2">
                    {hasDiscount(product) && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="font-black text-[#FF8BBA]">
                      {displayPrice(product).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">DT</span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="self-start p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                  title="Remove from favorites"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}

            {/* View All Button */}
            <Link href="/favorites" className="block pt-4">
              <Button className="w-full bg-[#FF8BBA] hover:bg-[#FF75AA] text-white rounded-full font-bold h-12">
                View All Favorites →
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
