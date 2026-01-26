import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "horizontal" | "vertical";
  color?: string;
}

export function Price({
  price,
  originalPrice,
  className,
  size = "md",
  variant = "horizontal",
  color = "text-primary"
}: PriceProps) {
  const hasDiscount = originalPrice && originalPrice > price;

  const sizeClasses = {
    xs: {
      current: "text-xs font-bold",
      original: "text-xs font-bold",
    },
    sm: {
      current: "text-base font-black",
      original: "text-xs font-semibold",
    },
    md: {
      current: "text-2xl font-black",
      original: "text-sm font-semibold",
    },
    lg: {
      current: "text-3xl font-black",
      original: "text-base font-semibold",
    },
    xl: {
      current: "text-4xl font-black",
      original: "text-lg font-semibold",
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn(
      "flex",
      variant === "vertical" ? "flex-col" : "items-center gap-2",
      className
    )}>
      <span className={cn(color, currentSize.current)}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className={cn(
          "line-through font-medium opacity-70",
          variant === "vertical" ? "text-gray-400" : "text-pink-300",
          currentSize.original
        )}>
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );
}
