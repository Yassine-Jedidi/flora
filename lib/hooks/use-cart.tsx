"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem } from "@/lib/types";
import { toast } from "sonner";

const CART_KEY = "flora_cart";

interface CartContextValue {
  cart: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: Ensure all items have the new flat price/image structure
        const migrated = parsed.map((item: CartItem & { images?: { url: string }[] }) => {
          return {
            ...item,
            price: item.price ?? (item.discountedPrice || item.originalPrice || 0),
            originalPrice: item.originalPrice ?? item.price,
            discountedPrice: item.discountedPrice ?? (item.price !== item.originalPrice ? item.price : undefined),
            image: item.image || (item.images?.[0]?.url) || "",
          };
        });
        const timer = setTimeout(() => setCart(migrated), 0);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (product: CartItem) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity + product.quantity > existing.stock) {
        toast.error(`Only ${existing.stock} items available in stock!`);
        return;
      }
      toast.success("Item quantity updated in cart!");
      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      );
      return;
    }

    if (product.quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock!`);
      return;
    }

    toast.success("Added to cart!");
    setCart((prev) => [...prev, product]);
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    if (quantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock!`);
      setCart((prev) =>
        prev.map((i) =>
          i.id === productId ? { ...i, quantity: item.stock } : i
        )
      );
      return;
    }

    if (quantity < 1) {
      setCart((prev) => prev.filter((i) => i.id !== productId));
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
