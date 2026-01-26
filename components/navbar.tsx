"use client";

import { Search, ShoppingBag, User, X, Loader2, Menu, Gift, Percent } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { searchProducts } from "@/app/actions/get-products";

const FavoritesSheet = dynamic(
  () => import("@/components/favorites-sheet").then((m) => m.FavoritesSheet),
  { ssr: false }
);

const CartDropdown = dynamic(
  () => import("@/components/cart-dropdown").then((m) => m.CartDropdown),
  { ssr: false }
);

interface SearchResult {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number | null;
  images: { url: string }[];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const outsideDesktop = searchRef.current && !searchRef.current.contains(target);
      const outsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);

      if (outsideDesktop && outsideMobile) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (id: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/product/${id}`);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-100">
      <div className="bg-white/80 backdrop-blur-md rounded-full border border-pink-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden rounded-full bg-pink-50 p-2 text-flora-dark hover:bg-pink-100 transition-colors">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Image
                    src="/flora sparkle.png"
                    alt="Flora Logo"
                    width={180}
                    height={80}
                    className="h-12 w-auto object-contain mb-6"
                  />
                </Link>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-4">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 ${pathname === "/shop"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Shop All
                  </Link>
                  <Link
                    href="/rings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 ${pathname === "/rings"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Rings
                  </Link>
                  <Link
                    href="/bracelets"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 ${pathname === "/bracelets"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Bracelets
                  </Link>
                  <Link
                    href="/necklaces"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 ${pathname === "/necklaces"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Necklaces
                  </Link>
                  <Link
                    href="/earrings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 ${pathname === "/earrings"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Earrings
                  </Link>
                  <Link
                    href="/packs"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 flex items-center gap-2 ${pathname === "/packs"
                      ? "text-primary"
                      : "text-flora-dark hover:text-primary"
                      }`}
                  >
                    Packs
                    <span className="bg-flora-purple text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse">
                      SAVE BIG
                    </span>
                  </Link>
                  <Link
                    href="/sale"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold transition-colors uppercase tracking-widest py-2 flex items-center gap-2 ${pathname === "/sale"
                      ? "text-red-500"
                      : "text-red-500 hover:text-red-600"
                      }`}
                  >
                    Sale %
                    <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-bounce">
                      HOT
                    </span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/flora sparkle.png"
              alt="Flora Logo"
              width={180}
              height={80}
              className="h-10 md:h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4 relative" ref={searchRef}>
            <div className="relative w-full">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-300 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-300" />
              )}
              <input
                type="text"
                placeholder="Find treasures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.length >= 2) {
                    setShowDropdown(false);
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="w-full rounded-full bg-pink-50/50 py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 border border-pink-100/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-pink-50 overflow-hidden z-110 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-pink-50/50 rounded-2xl transition-colors text-left group"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-flora-dark truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs font-black text-primary">
                          {(product.discountedPrice || product.originalPrice).toFixed(2)} DT
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowDropdown(false)}
                  className="block bg-pink-50/30 p-3 border-t border-pink-100/50 hover:bg-pink-50 transition-colors"
                >
                  <p className="text-[10px] text-center font-bold text-primary uppercase tracking-widest">
                    Press enter to see all results
                  </p>
                </Link>
              </div>
            )}

            {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-pink-50 p-6 text-center z-110 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-bold text-gray-400">No treasures found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <Link
              href="/shop"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/shop"
                ? "text-primary"
                : "text-flora-dark hover:text-primary"
                }`}
            >
              Shop All
            </Link>
            <Link
              href="/rings"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/rings"
                ? "text-primary"
                : "text-flora-dark hover:text-primary"
                }`}
            >
              Rings
            </Link>
            <Link
              href="/bracelets"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/bracelets"
                ? "text-primary"
                : "text-flora-dark hover:text-primary"
                }`}
            >
              Bracelets
            </Link>
            <Link
              href="/necklaces"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/necklaces"
                ? "text-primary"
                : "text-flora-dark hover:text-primary"
                }`}
            >
              Necklaces
            </Link>
            <Link
              href="/earrings"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/earrings"
                ? "text-primary"
                : "text-flora-dark hover:text-primary"
                }`}
            >
              Earrings
            </Link>
            <Link
              href="/packs"
              className={`relative flex items-center gap-1 text-xs font-bold transition-all uppercase tracking-widest group/packs ${pathname === "/packs"
                ? "text-primary"
                : "text-flora-dark hover:text-flora-purple"
                }`}
            >
              <Gift className={`w-3.5 h-3.5 transition-transform group-hover/packs:scale-110 ${pathname === "/packs" ? "text-primary" : "text-flora-purple"}`} />
              Packs
              <span className="absolute -top-4 -right-2 bg-flora-purple text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm transition-transform group-hover/packs:-translate-y-1">
                GIFT
              </span>
            </Link>
            <Link
              href="/sale"
              className={`relative flex items-center gap-1 text-xs font-bold transition-all uppercase tracking-widest group/sale ${pathname === "/sale"
                ? "text-red-500"
                : "text-red-500 hover:text-red-600 font-black"
                }`}
            >
              <Percent className="w-3.5 h-3.5 transition-transform group-hover/sale:rotate-12" />
              Sale
              <span className="absolute -top-4 -right-2 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm transition-transform group-hover/sale:-translate-y-1">
                HOT
              </span>
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden rounded-full bg-pink-50 p-2 text-flora-dark hover:bg-pink-100 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <CartDropdown />
            <FavoritesSheet />
            <button className="rounded-full bg-[#3E343C] p-2 text-white hover:bg-primary transition-all duration-300 shadow-md">
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top-2 duration-200" ref={mobileSearchRef}>
            <div className="relative w-full">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-300 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-300" />
              )}
              <input
                type="text"
                placeholder="Find treasures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.length >= 2) {
                    setShowDropdown(false);
                    setMobileSearchOpen(false);
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                className="w-full rounded-full bg-pink-50/50 py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 border border-pink-100/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Mobile Search Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-pink-50 overflow-hidden z-110">
                  <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          handleProductClick(product.id);
                          setMobileSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-pink-50/50 rounded-2xl transition-colors text-left group"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-gray-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-flora-dark truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs font-black text-primary">
                            {(product.discountedPrice || product.originalPrice).toFixed(2)} DT
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-pink-50 p-4 text-center z-110">
                  <p className="text-sm font-bold text-gray-400">No treasures found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
