import { getFeaturedProducts } from "@/app/actions/get-products";
import { ProductCard } from "@/components/shop/product-card";
import { Sparkles } from "lucide-react";

export async function FeaturedSection() {
    const featuredProducts = await getFeaturedProducts();

    if (featuredProducts.length === 0) return null;

    return (
        <section className="py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="bg-pink-100 text-[#FF8BBA] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Trending Now
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#003366]">
                        Featured Treasures ✨
                    </h2>
                    <p className="text-gray-500 max-w-lg text-lg">
                        Discover our most loved pieces, handpicked just for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
