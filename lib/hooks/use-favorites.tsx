"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Product } from "@/lib/types";

const FAVORITES_KEY = "flora_favorites";

interface FavoritesContextValue {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

const readFavoritesFromStorage = (): Product[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    return stored ? (JSON.parse(stored) as Product[]) : [];
  } catch (error) {
    console.error("Error parsing favorites from localStorage:", error);
    return [];
  }
};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persisted = readFavoritesFromStorage();
    if (persisted.length > 0) {
      // Use setTimeout to avoid cascading render warning
      const timer = setTimeout(() => setFavorites(persisted), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favorites]);

  const addFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === product.id)) {
        return prev.filter((fav) => fav.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isFavorite = useCallback((productId: string) =>
    favorites.some((fav) => fav.id === productId),
    [favorites]
  );

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
