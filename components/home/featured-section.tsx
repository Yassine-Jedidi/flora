import { getFeaturedProducts } from "@/app/actions/get-products";
import { ProductCard } from "@/components/shop/product-card";
import { Sparkles } from "lucide-react";
import { Bow } from "@/components/icons/bow";

export async function FeaturedSection() {
    const featuredProducts = await getFeaturedProducts();

    if (featuredProducts.length === 0) return null;

    return (
        <section className="py-20 w-[95%] max-w-7xl mx-auto">
            <div className="w-full">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-purple-100 shadow-[0_4px_15px_-3px_rgba(167,139,250,0.15)] transition-all hover:scale-105">
                        <Sparkles className="w-4 h-4 text-flora-purple fill-flora-purple/20" />
                        <span className="text-flora-purple text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                            Trending Now
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter drop-shadow-sm flex items-center justify-center flex-wrap gap-2 md:gap-3 px-4">
                        <span>Featured Treasures</span>
                        <Bow className="w-8 h-8 md:w-14 md:h-14 text-primary shrink-0" />
                    </h2>
                    <p className="text-[#B08B9B] max-w-lg text-lg font-medium opacity-90">
                        Discover our most loved pieces, handpicked just for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section >
    );
}
