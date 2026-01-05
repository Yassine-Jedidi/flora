"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: { url: string }[];
        category: { name: string };
        isFeatured?: boolean;
        createdAt: Date | string;
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

    return (
        <div className="group flex flex-col bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-50 animate-in fade-in zoom-in-95 duration-700">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#F9FAFB]">
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

                {/* Heart Icon */}
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-[#FF8BBA] fill-[#FF8BBA]" />
                </button>
            </div>

            {/* Content Section */}
            <div className="mt-6 flex flex-col gap-3 px-2">
                <h3 className="text-xl font-black text-[#003366] group-hover:text-pink-500 transition-colors line-clamp-1">
                    {product.name}
                </h3>

                {/* Dotted Divider */}
                <div className="w-full border-t border-dotted border-gray-200 my-1" />

                <div className="flex items-center justify-between pb-2">
                    <span className="text-2xl font-black text-[#FF8BBA]">
                        {product.price.toFixed(2)} <span className="text-sm">DT</span>
                    </span>

                    <button className="w-12 h-12 rounded-full bg-[#E6F7F9] hover:bg-[#D1F0F4] text-[#42B8C5] flex items-center justify-center transition-all shadow-sm hover:scale-110">
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
