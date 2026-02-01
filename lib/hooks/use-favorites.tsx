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
import { useSession } from "@/lib/auth-client";
import { getWishlist, toggleWishlistProduct, syncWishlist } from "@/app/actions/wishlist";
import { toast } from "sonner";

const FAVORITES_KEY = "flora_favorites";

interface FavoritesContextValue {
  favorites: Product[];
  addFavorite: (product: Product) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  isLoading: boolean;
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
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load and sync logic
  useEffect(() => {
    const initializeFavorites = async () => {
      setIsLoading(true);
      if (session) {
        // User is logged in
        // 1. Check for local items to sync
        const localItems = readFavoritesFromStorage();
        if (localItems.length > 0) {
          try {
            const ids = localItems.map((p) => p.id);
            await syncWishlist(ids);
            // Clear local storage after sync
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(FAVORITES_KEY);
            }
            toast.success("Favorites synced to your account!");
          } catch (error) {
            console.error("Failed to sync favorites", error);
          }
        }

        // 2. Fetch from server
        try {
          const result = await getWishlist();
          if (result.success && result.data) {
            setFavorites(result.data as Product[]);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist", error);
        }
      } else {
        // Guest user - load from local storage
        const persisted = readFavoritesFromStorage();
        setFavorites(persisted);
      }
      setIsLoading(false);
    };

    if (typeof window !== "undefined") {
      initializeFavorites();
    }
  }, [session]);

  // Sync to localStorage for guests only
  useEffect(() => {
    if (typeof window === "undefined" || session) {
      return;
    }

    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favorites, session]);

  const addFavorite = useCallback(async (product: Product) => {
    if (session) {
      // Optimistic update
      setFavorites((prev) => [...prev, product]);
      const result = await toggleWishlistProduct(product.id);
      if (!result.success) {
        // Revert on failure
        setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        if (result.error) toast.error(result.error);
      } else if (result.action === 'removed') {
        // Should not happen in 'add', but strictly technically toggle returns removed if it existed.
        // Since we are adding, we expect it to be added.
        // If it was removed, it means it was already there?
        // Let's just trust getWishlist or handle specific error.
        // For now, simpler to just use toggle logic for DB.
        // But here, let's just assume success or error.
      }
    } else {
      setFavorites((prev) => {
        if (prev.some((fav) => fav.id === product.id)) return prev;
        return [...prev, product];
      });
    }
  }, [session]);

  const removeFavorite = useCallback(async (productId: string) => {
    if (session) {
      // Optimistic
      const prevFavorites = [...favorites];
      setFavorites((prev) => prev.filter((p) => p.id !== productId));

      const result = await toggleWishlistProduct(productId);
      if (!result.success) {
        setFavorites(prevFavorites);
        toast.error(result.error || "Failed to remove from wishlist");
      } else if (result.action === 'added') {
        // Should not happen for remove
      }
    } else {
      setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
    }
  }, [favorites, session]); // Added favorites dependency for optimistic revert

  const toggleFavorite = useCallback(async (product: Product) => {
    const isFav = favorites.some((fav) => fav.id === product.id);

    if (session) {
      // Optimistic
      if (isFav) {
        setFavorites(prev => prev.filter(p => p.id !== product.id));
      } else {
        setFavorites(prev => [...prev, product]);
      }

      const result = await toggleWishlistProduct(product.id);
      if (!result.success) {
        // Revert
        if (isFav) {
          setFavorites(prev => [...prev, product]);
        } else {
          setFavorites(prev => prev.filter(p => p.id !== product.id));
        }
        toast.error(result.error || "Failed to update wishlist");
      }
    } else {
      if (isFav) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== product.id));
      } else {
        setFavorites((prev) => [...prev, product]);
      }
    }
  }, [favorites, session]);

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
      isLoading
    }),
    [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, isLoading]
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
