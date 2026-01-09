import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  type: "new" | "bestseller" | "discount" | "category";
  content?: string | number;
  className?: string;
}

export function ProductBadge({ type, content, className }: ProductBadgeProps) {
  if (type === "new") {
    return (
      <span className={cn(
        "bg-[#A78BFA] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md inline-block rotate-3",
        className
      )}>
        NEW
      </span>
    );
  }

  if (type === "bestseller") {
    return (
      <span className={cn(
        "bg-[#FF8BBA] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md inline-block -rotate-6",
        className
      )}>
        BESTSELLER
      </span>
    );
  }

  if (type === "discount") {
    return (
      <span className={cn(
        "bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md inline-block rotate-2",
        className
      )}>
        -{content}%
      </span>
    );
  }

  if (type === "category") {
    return (
      <span className={cn(
        "text-[10px] font-black text-[#FF8BBA] bg-pink-50 px-3 py-1 rounded-full uppercase tracking-widest border border-pink-100",
        className
      )}>
        {content}
      </span>
    );
  }

  return null;
}
