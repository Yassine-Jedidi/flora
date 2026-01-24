"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "popular";

    const handleSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FF8BBA] rounded-full" />
                <label className="text-xs font-black text-[#3E343C] uppercase tracking-[0.2em]">
                    Sort Selection
                </label>
            </div>
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Popular", value: "popular" },
                    { label: "Newest", value: "newest" },
                    { label: "Price", value: "price" }
                ].map((sort) => (
                    <button
                        key={sort.value}
                        onClick={() => handleSort(sort.value)}
                        className={`
                            ${currentSort === sort.value
                                ? "bg-[#FF8BBA] text-white shadow-lg shadow-pink-100 scale-105"
                                : "bg-white border border-pink-100 text-[#8B7E84] hover:border-[#FF8BBA] hover:text-[#FF8BBA]"
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
