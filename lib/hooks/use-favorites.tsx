"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

export interface FavoriteProduct {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice?: number;
  images: { url: string }[];
  category: { name: string };
  isFeatured?: boolean;
  createdAt: Date | string;
}

const FAVORITES_KEY = "flora_favorites";

interface FavoritesContextValue {
  favorites: FavoriteProduct[];
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: FavoriteProduct) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

const readFavoritesFromStorage = (): FavoriteProduct[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    return stored ? (JSON.parse(stored) as FavoriteProduct[]) : [];
  } catch (error) {
    console.error("Error parsing favorites from localStorage:", error);
    return [];
  }
};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persisted = readFavoritesFromStorage();
    if (persisted.length > 0) {
      // Use a small delay to avoid cascading render warning in some environments
      // or just accept that we need to sync with storage on mount.
      setFavorites(persisted);
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

  const addFavorite = (product: FavoriteProduct) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
  };

  const toggleFavorite = (product: FavoriteProduct) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === product.id)) {
        return prev.filter((fav) => fav.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (productId: string) =>
    favorites.some((fav) => fav.id === productId);

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
    }),
    [favorites]
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
