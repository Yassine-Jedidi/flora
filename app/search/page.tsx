import { searchProducts } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { CollectionHeader } from "@/components/shop/collection-header";
import { Bow } from "@/components/icons/bow";
import { Search } from "lucide-react";

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q: query } = await searchParams;
    const products = query ? await searchProducts(query, 40) : [];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32">
                <CollectionHeader
                    title={query ? `Results for "${query}"` : "Search"}
                    subtitle={query ? `We found ${products.length} treasures matching your search` : "Find your next signature piece"}
                    showCollectionWord={false}
                />

                {/* Filter & Count Row */}
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-pink-50 pb-8 gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <label className="text-sm font-black text-flora-dark uppercase tracking-[0.2em] flex items-center gap-2">
                                    Search Gallery <Bow className="w-4 h-4 text-primary" />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="bg-white border border-pink-100 text-primary px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                    {products.length} {products.length === 1 ? 'Treasure' : 'Treasures'} Found
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="container mx-auto px-4 pb-24">
                    {!query ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-primary" />
                            </div>
                            <p className="text-xl font-black text-flora-dark mb-2 text-center">
                                What are you looking for?
                            </p>
                            <p className="text-[#B08B9B] font-medium text-center">Enter a keyword to start searching for treasures. ✨</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-primary" />
                            </div>
                            <p className="text-xl font-black text-flora-dark mb-2 text-center">
                                No treasures found for &quot;{query}&quot;
                            </p>
                            <p className="text-[#B08B9B] font-medium text-center">Try a different keyword or explore our treasures! ✨</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
