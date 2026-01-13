"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface InventoryFiltersProps {
  categories: Category[];
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "live", label: "Live" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

const stockOptions = [
  { value: "all", label: "All Stock" },
  { value: "inStock", label: "In Stock" },
  { value: "lowStock", label: "Low Stock" },
  { value: "outOfStock", label: "Out of Stock" },
];

export function InventoryFilters({ categories }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentStock = searchParams.get("stock") || "all";

  const updateFilters = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to page 1 when filtering
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchValue);
  };

  const clearFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("status") ||
    searchParams.get("stock");

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 rounded-full border-pink-100 focus:border-pink-300 focus:ring-pink-200"
          />
        </div>
        <Button
          type="submit"
          className="rounded-full bg-pink-500 hover:bg-pink-600 text-white px-6"
          disabled={isPending}
        >
          Search
        </Button>
      </form>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm text-gray-500 mr-2">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-all rounded-full px-3 py-1 text-xs font-medium",
              currentCategory === "all"
                ? "bg-pink-500 text-white border-pink-500 hover:bg-pink-600"
                : "bg-white text-gray-600 border-pink-100 hover:bg-pink-50"
            )}
            onClick={() => updateFilters("category", "all")}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all rounded-full px-3 py-1 text-xs font-medium",
                currentCategory === cat.id
                  ? "bg-pink-500 text-white border-pink-500 hover:bg-pink-600"
                  : "bg-white text-gray-600 border-pink-100 hover:bg-pink-50"
              )}
              onClick={() => updateFilters("category", cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        <div className="w-px h-6 bg-pink-100 mx-2 hidden sm:block" />

        {/* Status Filter */}
        <div className="flex flex-wrap gap-1">
          {statusOptions.map((option) => (
            <Badge
              key={option.value}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all rounded-full px-3 py-1 text-xs font-medium",
                currentStatus === option.value
                  ? option.value === "live"
                    ? "bg-green-500 text-white border-green-500"
                    : option.value === "paused"
                    ? "bg-amber-500 text-white border-amber-500"
                    : option.value === "archived"
                    ? "bg-gray-500 text-white border-gray-500"
                    : "bg-pink-500 text-white border-pink-500"
                  : "bg-white text-gray-600 border-pink-100 hover:bg-pink-50"
              )}
              onClick={() => updateFilters("status", option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>

        <div className="w-px h-6 bg-pink-100 mx-2 hidden sm:block" />

        {/* Stock Filter */}
        <div className="flex flex-wrap gap-1">
          {stockOptions.map((option) => (
            <Badge
              key={option.value}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all rounded-full px-3 py-1 text-xs font-medium",
                currentStock === option.value
                  ? option.value === "outOfStock"
                    ? "bg-red-500 text-white border-red-500"
                    : option.value === "lowStock"
                    ? "bg-orange-500 text-white border-orange-500"
                    : option.value === "inStock"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-pink-500 text-white border-pink-500"
                  : "bg-white text-gray-600 border-pink-100 hover:bg-pink-50"
              )}
              onClick={() => updateFilters("stock", option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-red-500 rounded-full ml-2"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="text-center text-sm text-pink-500 animate-pulse">
          Loading...
        </div>
      )}
    </div>
  );
}
