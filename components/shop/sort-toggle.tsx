"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function SortToggle() {
    const t = useTranslations("Shop");
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "popular";

    const sortOptions = [
        { label: t("sort.popular"), value: "popular" },
        { label: t("sort.newest"), value: "newest" },
        { label: t("sort.priceAsc"), value: "price-asc" },
        { label: t("sort.priceDesc"), value: "price-desc" }
    ];

    const handleSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <label className="text-xs font-black text-flora-dark uppercase tracking-[0.2em]">
                    {t("filters.sort")}
                </label>
            </div>
            <div className="flex flex-wrap gap-2">
                {sortOptions.map((sort) => (
                    <button
                        key={sort.value}
                        onClick={() => handleSort(sort.value)}
                        className={`
                            ${currentSort === sort.value
                                ? "bg-primary text-white shadow-lg shadow-pink-100 scale-105"
                                : "bg-white border border-pink-100 text-[#8B7E84] hover:border-primary hover:text-primary"
                            }
                            px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                            active:scale-95
                        `}
                    >
                        {sort.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
