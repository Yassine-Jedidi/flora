import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  type: "new" | "bestseller" | "discount" | "category";
  content?: string | number;
  className?: string;
}

export function ProductBadge({ type, content, className }: ProductBadgeProps) {
  const baseStyles = "text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md inline-block transition-transform hover:scale-110 cursor-default";

  if (type === "new") {
    return (
      <span className={cn(
        "bg-[#A78BFA] text-white -rotate-3",
        baseStyles,
        className
      )}>
        NEW
      </span>
    );
  }

  if (type === "bestseller") {
    return (
      <span className={cn(
        "bg-[#FF8BBA] text-white rotate-3",
        baseStyles,
        className
      )}>
        BESTSELLER
      </span>
    );
  }

  if (type === "discount") {
    return (
      <span className={cn(
        "bg-red-500 text-white -rotate-6",
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
        "bg-[#FF8BBA] text-white uppercase tracking-wider rotate-2",
        baseStyles,
        className
      )}>
        {content}
      </span>
    );
  }

  return null;
}
