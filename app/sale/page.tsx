import { getSaleProducts } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { SortToggle } from "@/components/shop/sort-toggle";
import { CategoryToggle } from "@/components/shop/category-toggle";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Metadata } from "next";

import { Bow } from "@/components/icons/bow";

export const metadata: Metadata = {
    title: "Sale Collection | Flora Accessories",
    description: "Discover our limited-time treasures with exclusive discounts",
};

export default async function SalePage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const { sort, category, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;
    const { products, total, totalPages } = await getSaleProducts(sort || "popular", category, currentPage);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Image-Matched Header */}
                <div className="relative overflow-hidden bg-[#FFF5F8] pt-40 pb-20">
                    {/* Dotted Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {/* Decorative Floating Squares */}
                    <style>{`
                        @keyframes bounce-high {
                            0%, 100% { transform: translateY(-50%) rotate(-6deg); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                            50% { transform: translateY(50%) rotate(-6deg); animation-timing-function: cubic-bezier(0,0,0.2,1); }
                        }
                    `}</style>
                    <div className="absolute top-1/4 left-[15%] w-10 h-10 bg-gradient-to-br from-white to-[#D2B48C] rotate-12 rounded-sm shadow-sm opacity-60 animate-bounce [animation-duration:3s]" />
                    <div className="absolute top-1/3 right-[12%] w-8 h-8 bg-gradient-to-tr from-white to-[#BC8F8F] rounded-sm shadow-sm opacity-50 [animation:bounce-high_4s_infinite]" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tight leading-none">
                                <span className="text-primary">Sale</span>{" "}
                                <span className="text-primary">Collection</span>
                            </h1>

                            <div className="flex items-center gap-3">
                                <p className="text-[#8B7E84] text-lg font-medium tracking-wide">
                                    Grab your favorite treasures at a special price
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Count Row */}
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-pink-50 pb-8 gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <label className="text-xs font-black text-flora-dark uppercase tracking-[0.2em] flex items-center gap-2">
                                    The Flora Gallery <Bow className="w-4 h-4 text-primary" />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="bg-white border border-pink-100 text-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                    {total} Treasures
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            <CategoryToggle />
                            <SortToggle />
                        </div>
                    </div>
                </div>

                {/* Simplified Grid */}
                <div className="container mx-auto px-4 pb-24">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <p className="text-xl font-black text-flora-dark mb-2 text-center">
                                {category && category !== "all"
                                    ? `No ${category} on sale right now`
                                    : "No items on sale at the moment"}
                            </p>
                            <p className="text-gray-400 font-medium text-center">Check back soon for new treasures! ✨</p>
                        </div>
                    ) : (
                        <>
                            <div key={`${sort || 'popular'}-${category || 'all'}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <PaginationControl
                                currentPage={currentPage}
                                totalPages={totalPages}
                                total={total}
                            />
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
