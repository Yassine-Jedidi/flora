import { getProductsByCategory } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryToggle } from "@/components/shop/category-toggle";
import { SortToggle } from "@/components/shop/sort-toggle";
import { PaginationControl } from "@/components/ui/pagination-control";
import { CollectionHeader } from "@/components/shop/collection-header";

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
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🎀</span>
                                <span className="text-2xl font-black text-[#3E343C] tracking-tight">The Flora Gallery</span>
                            </div>
                            <p className="text-[10px] font-black text-[#8B7E84]/60 uppercase tracking-[0.3em]">
                                {total} {total === 1 ? 'item' : 'items'}
                            </p>
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
                            <p className="text-xl font-black text-[#003366] mb-2 text-center">
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
