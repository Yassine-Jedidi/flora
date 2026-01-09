import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  return `${numericPrice.toFixed(2)} DT`;
}

export function calculateDiscount(original: number, discounted: number) {
  if (!discounted || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 100);
}
