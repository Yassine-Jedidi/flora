"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  product: any;
  className?: string;
}

export default function FavoriteButton({
  product,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product);
  };

  const active = isFavorite(product.id);

  return (
    <button
      onClick={handleToggleFavorite}
      className={cn(
        "absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 hover:bg-pink-50 transition-all z-20 group/heart",
        className
      )}
    >
      {active ? (
        <Heart className="w-5 h-5 text-[#FF8BBA] fill-[#FF8BBA] group-hover/heart:fill-[#FF6B9A] group-hover/heart:text-[#FF6B9A] transition-colors" />
      ) : (
        <Heart className="w-5 h-5 text-[#FF8BBA] group-hover/heart:fill-[#FF8BBA]/20 transition-all" />
      )}
    </button>
  );
}
