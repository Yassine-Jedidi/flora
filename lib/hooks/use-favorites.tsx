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
            const syncResult = await syncWishlist(ids);

            // Only clear local storage and show success if sync succeeded
            if (syncResult.success) {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(FAVORITES_KEY);
              }
              toast.success("Favorites synced to your account!");
            } else {
              // Sync failed - keep local storage intact and log the error
              console.error("Failed to sync favorites:", syncResult.error);
              toast.error("Failed to sync favorites. Your items are saved locally.");
            }
          } catch (error) {
            console.error("Failed to sync favorites", error);
            toast.error("Failed to sync favorites. Your items are saved locally.");
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
      // Store previous state for potential revert
      const prevFavorites = [...favorites];

      // Optimistic update - add product (check for duplicates)
      setFavorites((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });

      const result = await toggleWishlistProduct(product.id);

      if (!result.success) {
        // Revert on failure
        setFavorites(prevFavorites);
        if (result.error) toast.error(result.error);
      } else {
        // Reconcile based on actual API result
        if (result.action === 'added') {
          // Confirm addition - ensure it exists once (deduplicate)
          setFavorites((prev) => {
            const filtered = prev.filter((p) => p.id !== product.id);
            return [...filtered, product];
          });
        } else if (result.action === 'removed') {
          // Item was already in wishlist and got removed - update state
          setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        }
      }
    } else {
      // Guest user - simple local state update with deduplication
      setFavorites((prev) => {
        if (prev.some((fav) => fav.id === product.id)) return prev;
        return [...prev, product];
      });
    }
  }, [favorites, session]);

  const removeFavorite = useCallback(async (productId: string) => {
    if (session) {
      // Store previous state for potential revert
      const prevFavorites = [...favorites];

      // Optimistic update
      setFavorites((prev) => prev.filter((p) => p.id !== productId));

      const result = await toggleWishlistProduct(productId);

      if (!result.success) {
        // Revert on failure
        setFavorites(prevFavorites);
        toast.error(result.error || "Failed to remove from wishlist");
      } else {
        // Reconcile based on actual API result
        if (result.action === 'removed') {
          // Confirm removal - ensure it's not in the list
          setFavorites((prev) => prev.filter((p) => p.id !== productId));
        } else if (result.action === 'added') {
          // Item wasn't in wishlist and got added - find and add it back
          const productToAdd = prevFavorites.find((p) => p.id === productId);
          if (productToAdd) {
            setFavorites((prev) => {
              const filtered = prev.filter((p) => p.id !== productId);
              return [...filtered, productToAdd];
            });
          }
        }
      }
    } else {
      // Guest user - simple local state update
      setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
    }
  }, [favorites, session]);

  const toggleFavorite = useCallback(async (product: Product) => {
    const isFav = favorites.some((fav) => fav.id === product.id);

    if (session) {
      // Store previous state for potential revert
      const prevFavorites = [...favorites];

      // Optimistic update
      if (isFav) {
        setFavorites(prev => prev.filter(p => p.id !== product.id));
      } else {
        setFavorites(prev => {
          const filtered = prev.filter(p => p.id !== product.id);
          return [...filtered, product];
        });
      }

      const result = await toggleWishlistProduct(product.id);

      if (!result.success) {
        // Revert on failure
        setFavorites(prevFavorites);
        toast.error(result.error || "Failed to update wishlist");
      } else {
        // Reconcile based on actual API result
        if (result.action === 'added') {
          // Ensure product exists once in favorites
          setFavorites((prev) => {
            const filtered = prev.filter((p) => p.id !== product.id);
            return [...filtered, product];
          });
        } else if (result.action === 'removed') {
          // Ensure product is removed from favorites
          setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        }
      }
    } else {
      // Guest user - simple toggle
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
