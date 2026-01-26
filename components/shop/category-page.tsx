import { getProductsByCategory } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryToggle } from "@/components/shop/category-toggle";
import { SortToggle } from "@/components/shop/sort-toggle";
import { PaginationControl } from "@/components/ui/pagination-control";
import { CollectionHeader } from "@/components/shop/collection-header";
import { Bow } from "@/components/icons/bow";

interface CategoryPageProps {
    categorySlug: string;
    title: string;
    subtitle: string;
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>;
}

export async function CategoryPage({
    categorySlug,
    title,
    subtitle,
    searchParams
}: CategoryPageProps) {
    const { sort, category, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;
    const filterCategory = categorySlug === "all" || categorySlug === "packs" ? category : undefined;
    const { products, total, totalPages } = await getProductsByCategory(categorySlug, sort || "popular", filterCategory, currentPage);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32">
                <CollectionHeader title={title} subtitle={subtitle} />

                {/* Filter & Count Row */}
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-pink-50 pb-8 gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                <label className="text-sm font-black text-flora-dark uppercase tracking-[0.2em] flex items-center gap-2">
                                    The Flora Gallery <Bow className="w-4 h-4 text-primary" />
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="bg-white border border-pink-100 text-primary px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                    {total} Treasures
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                            {(categorySlug === "all" || categorySlug === "packs") && <CategoryToggle />}
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
                                    ? `No ${category} found`
                                    : "New collection arriving soon."}
                            </p>
                            <p className="text-gray-400 font-medium text-center">Check back soon for new treasures! ✨</p>
                        </div>
                    ) : (
                        <>
                            <div key={sort || 'popular'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
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
