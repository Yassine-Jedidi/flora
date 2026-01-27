"use client";

import { useState, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Timer,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm, useWatch } from "react-hook-form";
import { useCart } from "@/lib/hooks/use-cart";
import { useFavorites } from "@/lib/hooks/use-favorites";
import dynamic from "next/dynamic";
import { ProductBadge } from "./product-badge";
import { Price } from "./price";
import { calculateDiscount } from "@/lib/utils";
import { Product } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FavoriteButton = dynamic(() => import("./favorite-button"), {
  ssr: false,
});

export function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);

  // Scroll to top IMMEDIATELY on mount (before paint)
  // We use useLayoutEffect to ensure this happens before the visual update
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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

  const rating = useMemo(() => {
    // Deterministic pseudo-random based on ID string
    const hash = product.id.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    // Map hash to 0 or 1 for 4.9 or 5.0
    const val = Math.abs(hash) % 2;
    return (4.9 + val / 10).toFixed(1);
  }, [product.id]);

  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const hash = product.id.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Initial seeded offset between 3 and 9 hours (in seconds)
    const seededOffset = (Math.abs(hash) % (6 * 3600)) + (3 * 3600);

    const tick = () => {
      const now = new Date();
      // Use the current day and product ID to create a stable "target end time"
      const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      // Calculate remaining time based on a cycle of the seeded duration
      // This ensures it actually counts down but is deterministic for that product/time
      const remaining = seededOffset - (secondsSinceMidnight % seededOffset);

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      setTimeLeft({ h, m, s });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [product.id]);

  const onAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      image: product.images[0]?.url || "",
      quantity,
      stock: product.stock,
    });
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
      <div className="lg:sticky lg:top-24 h-fit space-y-8">
        <div className="relative">
          <div className="relative mx-auto max-w-[520px] aspect-square overflow-hidden rounded-[3rem] bg-[#F9FAFB] border border-pink-50 shadow-sm group">
            {/* Background Glows shifted inside here to prevent horizontal body scroll */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-100/50 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-50/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full h-full touch-none">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 50) {
                      prevImage();
                    } else if (info.offset.x < -50) {
                      nextImage();
                    }
                  }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <Skeleton className="absolute inset-0 w-full h-full bg-gray-100" />
                  {product.images[selectedImage] ? (
                    <Image
                      src={product.images[selectedImage].url}
                      alt={product.name}
                      fill
                      className="object-cover pointer-events-none"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <ShoppingBag className="w-20 h-20 text-gray-200" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prevImage();
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-primary hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage();
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-primary hover:scale-110 active:scale-95"
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
                  className={`h-2 rounded-full transition-all duration-500 ${selectedImage === idx ? "w-8 bg-primary" : "w-2 bg-pink-200"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex justify-start md:justify-center gap-3 md:gap-4 mt-6 overflow-x-auto pb-2 scrollbar-none px-4 md:px-0">
              {product.images.map((img, index) => (
                <button
                  key={img.url}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-18 h-18 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${selectedImage === index
                    ? "border-primary shadow-md scale-95"
                    : "border-transparent hover:border-pink-200"
                    }`}
                >
                  <Skeleton className="absolute inset-0 w-full h-full bg-gray-100" />
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-8">
        {/* Limited Offer Timer */}
        {timeLeft && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-purple-50/50 border border-purple-100/40 rounded-[1.5rem] p-4 mb-2 shadow-sm"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 blur-lg opacity-20 animate-pulse rounded-full" />
              <div className="w-10 h-10 rounded-xl bg-purple-100/50 flex items-center justify-center text-purple-500 relative z-10">
                <Timer className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] leading-none mb-1.5 font-sans">
                Limited Time Offer
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-purple-900/60 leading-none">Ending in:</span>
                <span className="text-[15px] font-black text-purple-600 font-mono tabular-nums leading-none">
                  {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        )}

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
                ({rating})
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-flora-dark leading-tight tracking-tight break-words">
            {product.name}
          </h1>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              {/* Special Pricing Logic for Packs */}
              {product.packItems && product.packItems.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {(() => {
                    const totalMarketValue = product.packItems.reduce(
                      (acc, pi) => acc + Number(pi.item.originalPrice) * pi.quantity,
                      0
                    );
                    const currentPrice = product.discountedPrice || product.originalPrice;

                    return (
                      <>
                        {totalMarketValue > currentPrice && (
                          <div className="flex items-center gap-2 mb-1">
                            <ProductBadge
                              type="discount"
                              content={calculateDiscount(totalMarketValue, currentPrice)}
                              noRotate
                            />
                          </div>
                        )}
                        <Price
                          price={currentPrice}
                          originalPrice={
                            totalMarketValue > currentPrice
                              ? totalMarketValue
                              : undefined
                          }
                          size="xl"
                        />
                      </>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {product.discountedPrice &&
                    product.discountedPrice < product.originalPrice && (
                      <div className="flex items-center gap-2 mb-1">
                        <ProductBadge
                          type="discount"
                          content={calculateDiscount(product.originalPrice, product.discountedPrice)}
                          noRotate
                        />
                      </div>
                    )}
                  <Price
                    price={product.discountedPrice || product.originalPrice}
                    originalPrice={product.discountedPrice ? product.originalPrice : undefined}
                    size="xl"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-pink-100 via-pink-50 to-transparent" />

        <div className="space-y-4">
          <div className="prose prose-sm max-w-none text-[#5D5056] leading-relaxed font-medium break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-[17px] leading-[1.8]" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-black text-flora-dark tracking-tight" {...props} />,
                ul: ({ node, ...props }) => <ul className="space-y-2 mb-4 last:mb-0 ml-2" {...props} />,
                li: ({ node, ...props }) => (
                  <li className="flex items-start gap-4 text-[16px]">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shadow-[0_0_8px_rgba(255,139,186,0.6)]" />
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
                h1: ({ node, ...props }) => <h1 className="text-2xl font-black text-flora-dark mb-4 mt-6 border-b-2 border-pink-50 pb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-black text-flora-dark mb-3 mt-6 flex items-center gap-2 group" {...props}>
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  {props.children}
                </h2>,
                h3: ({ node, ...props }) => <h3 className="text-lg font-black text-flora-dark mb-2 mt-4" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-6 border-t border-pink-100/50" {...props} />,
              }}
            >
              {product.description}
            </ReactMarkdown>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-5 border-t border-dotted border-pink-100">
          {/* Pack Contents */}
          {product.packItems && product.packItems.length > 0 && (
            <div className="space-y-4 pb-6 border-b border-dotted border-pink-100">
              <h3 className="text-lg font-black text-flora-dark">This Pack Includes:</h3>
              <div className="space-y-3">
                {product.packItems.map((packItem) => (
                  <Link
                    key={packItem.item.id}
                    href={`/product/${packItem.item.id}`}
                    target="_blank"
                    className="flex items-center gap-4 p-3 bg-pink-50/30 rounded-2xl border border-pink-50 hover:bg-pink-50 hover:border-pink-100 transition-all group"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                      {packItem.item.images?.[0]?.url ? (
                        <Image
                          src={packItem.item.images[0].url}
                          alt={packItem.item.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-flora-dark group-hover:text-primary transition-colors truncate">
                        {packItem.item.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mt-0.5">
                          Qty: {packItem.quantity}
                        </span>
                        <span className="text-gray-300 leading-none">•</span>
                        <Price
                          price={packItem.item.discountedPrice || packItem.item.originalPrice}
                          originalPrice={packItem.item.discountedPrice ? packItem.item.originalPrice : undefined}
                          size="xs"
                          color="text-primary"
                          className="flex-nowrap"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 text-gray-400 hover:text-primary transition-all active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-lg font-black text-flora-purple">
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
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 text-gray-400 hover:text-primary transition-all active:scale-90"
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
              className="h-14 rounded-2xl bg-flora-purple hover:bg-[#8B5CF6] text-white text-base font-black shadow-lg shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95 gap-3 uppercase tracking-tight"
            >
              Add to Cart ✨
            </Button>

            <Button
              type="button"
              onClick={() => toggleFavorite(product)}
              className="h-11 rounded-2xl bg-white border-2 border-pink-100 text-primary hover:bg-pink-50 text-xs font-black transition-all hover:scale-[1.02] active:scale-95 gap-3"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite(product.id) ? "fill-primary" : ""
                  }`}
              />
              Add to favorites
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-dotted border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-flora-dark">
                Quality Guaranteed
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Premium Materials
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-flora-purple">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-flora-dark">
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
