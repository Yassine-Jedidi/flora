"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/hooks/use-cart";
import dynamic from "next/dynamic";

const FavoriteButton = dynamic(() => import("./favorite-button"), {
  ssr: false,
});

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    originalPrice: number;
    discountedPrice?: number;
    images: { url: string }[];
    category: { name: string };
    isFeatured?: boolean;
    createdAt: Date | string;
    isNew?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.isNew;
  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.discountedPrice) /
          product.originalPrice) *
          100
      )
    : 0;
  const displayPrice = product.discountedPrice || product.originalPrice;

  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      image: product.images[0]?.url || "",
      quantity: 1
    });
    toast.success("Added to cart! ✨");
  };

  return (
    <div className="group flex flex-col bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 animate-in fade-in zoom-in-95 duration-700">
      {/* Image Container */}
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#F9FAFB]"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <ShoppingBag className="w-10 h-10 text-gray-200" />
          </div>
        )}

        {/* Badges Container */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
          {/* Discount Badge */}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md inline-block rotate-2">
              -{discountPercentage}%
            </span>
          )}

          {/* Bestseller Badge */}
          {product.isFeatured && (
            <span className="bg-[#FF8BBA] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md inline-block -rotate-6">
              BESTSELLER
            </span>
          )}

          {/* New Badge */}
          {isNew && (
            <span className="bg-[#A78BFA] text-white text-[10px] font-black px-3 py-1.5 mt-1 rounded-lg shadow-md inline-block rotate-3">
              NEW
            </span>
          )}
        </div>

        {/* Heart Icon - Handled by a client-only component to avoid hydration issues */}
        <FavoriteButton product={product} />
      </Link>

      {/* Content Section */}
      <div className="mt-6 flex flex-col gap-3 px-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-black text-[#003366] group-hover:text-pink-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Dotted Divider */}
        <div className="w-full border-t border-dotted border-gray-200 my-1" />

        <div className="flex items-center justify-between pb-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-sm font-semibold text-gray-400 line-through">
                {product.originalPrice.toFixed(2)} DT
              </span>
            )}
            <span className="text-2xl font-black text-[#FF8BBA]">
              {displayPrice.toFixed(2)} <span className="text-sm">DT</span>
            </span>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-12 h-12 rounded-full bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center transition-all shadow-sm hover:scale-110"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
