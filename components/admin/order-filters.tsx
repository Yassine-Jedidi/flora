"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderFiltersProps {
  governorates: string[];
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const dateOptions = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export function OrderFilters({ governorates }: OrderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const currentStatus = searchParams.get("status") || "all";
  const currentGovernorate = searchParams.get("governorate") || "all";
  const currentDateRange = searchParams.get("dateRange") || "all";

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
    searchParams.get("status") ||
    searchParams.get("governorate") ||
    searchParams.get("dateRange");

  return (
    <div
      className={cn(
        "space-y-4 mb-6 transition-opacity duration-200",
        isPending && "opacity-60"
      )}
    >
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by customer name or phone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10 rounded-full border-pink-100 focus:border-pink-300 focus:ring-pink-200"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                updateFilters("search", "");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
      <div
        className={cn(
          "flex flex-wrap gap-3 items-center",
          isPending && "pointer-events-none"
        )}
      >
        {/* Status Filter */}
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilters("status", option.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                currentStatus === option.value
                  ? "bg-pink-500 text-white shadow-sm"
                  : "bg-pink-50 text-gray-600 hover:bg-pink-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-pink-200 hidden sm:block" />

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-1.5">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilters("dateRange", option.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                currentDateRange === option.value
                  ? "bg-[#003366] text-white shadow-sm"
                  : "bg-blue-50 text-gray-600 hover:bg-blue-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-pink-200 hidden sm:block" />

        {/* Governorate Filter */}
        {governorates.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilters("governorate", "all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                currentGovernorate === "all"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-50 text-gray-600 hover:bg-emerald-100"
              )}
            >
              All Locations
            </button>
            {governorates.map((gov) => (
              <button
                key={gov}
                onClick={() => updateFilters("governorate", gov)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  currentGovernorate === gov
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-emerald-50 text-gray-600 hover:bg-emerald-100"
                )}
              >
                {gov}
              </button>
            ))}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="w-px h-6 bg-pink-200 hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
