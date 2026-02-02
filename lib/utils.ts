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

/**
 * Escapes HTML special characters to prevent XSS attacks in HTML templates
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return String(text).replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
}
