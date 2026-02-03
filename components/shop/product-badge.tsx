import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ProductBadgeProps {
  type: "new" | "bestseller" | "discount" | "category";
  content?: string | number;
  className?: string;
  noRotate?: boolean;
}

export function ProductBadge({ type, content, className, noRotate }: ProductBadgeProps) {
  const t = useTranslations("Shop.badges");
  const baseStyles = "text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md inline-block transition-transform hover:scale-110 cursor-default";

  if (type === "new") {
    return (
      <span className={cn(
        "bg-flora-purple text-white",
        !noRotate && "rotate-3",
        baseStyles,
        className
      )}>
        {t("new")}
      </span>
    );
  }

  if (type === "bestseller") {
    return (
      <span className={cn(
        "bg-primary text-white",
        !noRotate && "-rotate-3",
        baseStyles,
        className
      )}>
        {t("bestseller")}
      </span>
    );
  }

  if (type === "discount") {
    return (
      <span className={cn(
        "bg-red-500 text-white",
        !noRotate && "rotate-3",
        baseStyles,
        className
      )}>
        -{content}%
      </span>
    );
  }

  if (type === "category") {
    return (
      <span className={cn(
        "bg-primary text-white uppercase tracking-wider",
        baseStyles,
        className
      )}>
        {content}
      </span>
    );
  }

  return null;
}
