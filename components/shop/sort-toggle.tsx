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
        <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-[#8B7E84]">Sort by:</label>
            <div className="bg-[#FDF2F7] p-1 rounded-full flex items-center">
                <button
                    onClick={() => handleSort("popular")}
                    className={`${currentSort === "popular"
                            ? "bg-white text-[#FF8BBA] shadow-sm"
                            : "text-[#8B7E84] hover:text-[#FF8BBA]"
                        } px-6 py-2 rounded-full text-sm font-bold transition-all`}
                >
                    Popular
                </button>
                <button
                    onClick={() => handleSort("newest")}
                    className={`${currentSort === "newest"
                            ? "bg-white text-[#FF8BBA] shadow-sm"
                            : "text-[#8B7E84] hover:text-[#FF8BBA]"
                        } px-6 py-2 rounded-full text-sm font-bold transition-all`}
                >
                    Newest
                </button>
                <button
                    onClick={() => handleSort("price")}
                    className={`${currentSort === "price"
                            ? "bg-white text-[#FF8BBA] shadow-sm"
                            : "text-[#8B7E84] hover:text-[#FF8BBA]"
                        } px-6 py-2 rounded-full text-sm font-bold transition-all`}
                >
                    Price
                </button>
            </div>
        </div>
    );
}
