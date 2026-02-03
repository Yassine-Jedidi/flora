"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function CategoryToggle() {
    const t = useTranslations("Shop");
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "all";

    const categories = [
        { label: t("filters.all"), slug: "all" },
        { label: t("titles.rings"), slug: "rings" },
        { label: t("titles.bracelets"), slug: "bracelets" },
        { label: t("titles.necklaces"), slug: "necklaces" },
        { label: t("titles.earrings"), slug: "earrings" },
    ];

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
        <div className="flex flex-col gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <label className="text-xs font-black text-flora-dark uppercase tracking-[0.2em]">
                    {t("filters.category")}
                </label>
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => handleCategory(cat.slug)}
                        className={`
                            ${currentCategory === cat.slug
                                ? "bg-primary text-white shadow-lg shadow-pink-100 scale-105"
                                : "bg-white border border-pink-100 text-[#8B7E84] hover:border-primary hover:text-primary"
                            }
                            px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                            active:scale-95
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
