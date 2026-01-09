"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm, useWatch } from "react-hook-form";
import { useCart } from "@/lib/hooks/use-cart";
import { useFavorites } from "@/lib/hooks/use-favorites";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ProductBadge } from "./product-badge";
import { Price } from "./price";
import { calculateDiscount } from "@/lib/utils";
import { Product } from "@/lib/types";

const FavoriteButton = dynamic(() => import("./favorite-button"), {
  ssr: false,
});

export function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);

  const form = useForm({
    defaultValues: {
      quantity: 1,
    },
  });

  const quantity = useWatch({
    control: form.control,
    name: "quantity",
    defaultValue: 1,
  });

  const onAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      image: product.images[0]?.url || "",
      quantity,
    });
    toast.success("Added to your cart! ✨");
  };

  const nextImage = useCallback(() => {
    if (product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  }, [product.images.length]);

  const prevImage = useCallback(() => {
    if (product.images.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  }, [product.images.length]);

  useEffect(() => {
    if (product.images.length <= 1) return;
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [nextImage, product.images.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Image Gallery */}
      <div className="relative space-y-8">
        {/* Background Glow */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-100/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-50/50 rounded-full blur-[100px] -z-10" />

        <div className="relative mx-auto max-w-[550px] aspect-square overflow-hidden rounded-[3rem] bg-[#F9FAFB] border border-pink-50 shadow-sm group">
          <div className="relative w-full h-full">
            {product.images.map((img, idx) => (
              <div
                key={img.url}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  selectedImage === idx ? "opacity-100 z-0" : "opacity-0 -z-10"
                }`}
              >
                <Image
                  src={img.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}

            {!product.images[0] && (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <ShoppingBag className="w-20 h-20 text-gray-200" />
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  prevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-[#FF8BBA] hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-[#FF8BBA] hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Share/Favorite on image */}
          <FavoriteButton
            product={product}
            className="top-6 right-6 w-12 h-12"
          />

          {/* Pulse pagination dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${
                  selectedImage === idx ? "w-8 bg-[#FF8BBA]" : "w-2 bg-pink-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex justify-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {product.images.map((img, index) => (
              <button
                key={img.url}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === index
                    ? "border-[#FF8BBA] shadow-md scale-95"
                    : "border-transparent hover:border-pink-200"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ProductBadge type="category" content={product.category.name} />
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-3 h-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-[10px] font-bold text-gray-400 ml-1">
                (4.9)
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#3E343C] leading-tight tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              {product.discountedPrice &&
                product.discountedPrice < product.originalPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <ProductBadge 
                      type="discount" 
                      content={calculateDiscount(product.originalPrice, product.discountedPrice)} 
                      className="rotate-0 transition-transform hover:scale-110"
                    />
                  </div>
                )}
              <Price 
                price={product.discountedPrice || product.originalPrice} 
                originalPrice={product.discountedPrice ? product.originalPrice : undefined}
                size="xl"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-pink-100 via-pink-50 to-transparent" />

        <div className="space-y-4">
          <p className="text-[#8B7E84] leading-relaxed text-lg">
            {product.description}
          </p>
        </div>

        <div className="flex flex-col gap-6 pt-6 border-t border-dotted border-pink-100">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
            <div className="flex flex-col">
              <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em]">
                Quantity
              </Label>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-full p-1.5 shadow-sm border border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const current = form.getValues("quantity");
                  if (current > 1) form.setValue("quantity", current - 1);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 text-gray-400 hover:text-[#FF8BBA] transition-all active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-lg font-black text-[#A78BFA]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = form.getValues("quantity");
                  if (current < product.stock) {
                    form.setValue("quantity", current + 1);
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 text-gray-400 hover:text-[#FF8BBA] transition-all active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={onAddToCart}
              className="h-14 rounded-2xl bg-[#A78BFA] hover:bg-[#8B5CF6] text-white text-base font-black shadow-lg shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95 gap-3 uppercase tracking-tight"
            >
              Add to Cart ✨
            </Button>

            <Button
              type="button"
              onClick={() => toggleFavorite(product)}
              className="h-11 rounded-2xl bg-white border-2 border-pink-100 text-[#FF8BBA] hover:bg-pink-50 text-xs font-black transition-all hover:scale-[1.02] active:scale-95 gap-3"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite(product.id) ? "fill-[#FF8BBA]" : ""
                }`}
              />
              Add to favorites
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-dotted border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#FF8BBA]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#3E343C]">
                Quality Guaranteed
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Premium Materials
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-[#A78BFA]">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#3E343C]">
                Fast Delivery
              </span>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                Delivery across Tunisia
                <div className="relative w-4 h-3 overflow-hidden rounded-sm">
                  <Image
                    src="https://flagcdn.com/tn.svg"
                    alt="Tunisia Flag"
                    fill
                    className="object-cover"
                  />
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
