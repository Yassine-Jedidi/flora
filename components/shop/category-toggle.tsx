"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = [
    { label: "All", slug: "all" },
    { label: "Rings", slug: "rings" },
    { label: "Bracelets", slug: "bracelets" },
    { label: "Necklaces", slug: "necklaces" },
    { label: "Earrings", slug: "earrings" },
];

export function CategoryToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "all";

    const handleCategory = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "all") {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-[#8B7E84]">Category:</label>
            <div className="bg-[#FDF2F7] p-1 rounded-full flex items-center overflow-x-auto no-scrollbar max-w-full">
                {categories.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => handleCategory(cat.slug)}
                        className={`${currentCategory === cat.slug
                            ? "bg-white text-[#FF8BBA] shadow-sm"
                            : "text-[#8B7E84] hover:text-[#FF8BBA]"
                            } px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
