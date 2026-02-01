"use client";

import React from "react";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/hooks/use-cart";
import dynamic from "next/dynamic";
import { ProductBadge } from "./product-badge";
import { Price } from "./price";

const FavoriteButton = dynamic(() => import("./favorite-button"), {
  ssr: false,
});

import { calculateDiscount } from "@/lib/utils";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.originalPrice;
  const discountPercentage = hasDiscount
    ? calculateDiscount(product.originalPrice, product.discountedPrice!)
    : 0;

  const { addItem } = useCart();

  // Track scroll/drag to prevent accidental navigation
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaX = Math.abs(e.clientX - startPos.x);
    const deltaY = Math.abs(e.clientY - startPos.y);
    // If moved more than 10px, consider it a drag/scroll
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      image: product.images[0]?.url || "",
      quantity: 1,
      stock: product.stock ?? 0,
    });
  };

  return (
    <div className="group flex flex-col bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 animate-in fade-in zoom-in-95 duration-700">
      {/* Image Container */}
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#F9FAFB] isolate"
        style={{
          WebkitBackfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{
              borderRadius: 'inherit',
            }}
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
            <ProductBadge type="discount" content={discountPercentage} />
          )}

          {/* Bestseller Badge */}
          {product.isFeatured && (
            <ProductBadge type="bestseller" />
          )}

          {/* New Badge */}
          {product.isNew && (
            <ProductBadge type="new" className="mt-1" />
          )}
        </div>

        {/* Heart Icon - Handled by a client-only component to avoid hydration issues */}
        <FavoriteButton product={product} />
      </Link>

      {/* Content Section */}
      <div className="mt-6 flex flex-col gap-3 px-2">
        <Link
          href={`/product/${product.id}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
        >
          <h3 className="text-xl font-black text-flora-dark group-hover:text-pink-500 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Dotted Divider */}
        <div className="w-full border-t border-dotted border-gray-200 my-1" />

        <div className="flex items-center justify-between pb-2">
          <Price
            price={product.discountedPrice || product.originalPrice}
            originalPrice={product.discountedPrice ? product.originalPrice : undefined}
          />

          <button
            onClick={handleAddToCart}
            className="w-12 h-12 rounded-full bg-flora-purple/10 hover:bg-flora-purple/20 text-flora-purple flex items-center justify-center transition-all shadow-sm hover:scale-110"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
