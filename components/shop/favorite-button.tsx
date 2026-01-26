"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/use-favorites";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

export default function FavoriteButton({
  product,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product);
    if (!active) {
      toast.success("Added to favorites! 💖", {
        description: product.name,
      });
    } else {
      toast.info("Removed from favorites", {
        description: product.name,
      });
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={cn(
        "absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 hover:bg-pink-50 transition-all z-20 group/heart",
        className
      )}
    >
      {active ? (
        <Heart className="w-5 h-5 text-primary fill-primary group-hover/heart:fill-[#FF6B9A] group-hover/heart:text-[#FF6B9A] transition-colors" />
      ) : (
        <Heart className="w-5 h-5 text-primary group-hover/heart:fill-primary/20 transition-all" />
      )}
    </button>
  );
}
