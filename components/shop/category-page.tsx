import { getProductsByCategory, getSaleProducts } from "@/app/actions/get-products";
import { BASE_URL } from "@/lib/constants/site";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryToggle } from "@/components/shop/category-toggle";
import { SortToggle } from "@/components/shop/sort-toggle";
import { PaginationControl } from "@/components/ui/pagination-control";
import { CollectionHeader } from "@/components/shop/collection-header";
import { Bow } from "@/components/icons/bow";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VALID_CATEGORIES } from "@/lib/constants/categories";

interface CategoryPageProps {
    categorySlug: string;
    title: string;
    subtitle: string;
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>;
    isSale?: boolean;
}

async function ProductGridWrapper({
    categorySlug,
    sort,
    category,
    currentPage,
    isSale
}: {
    categorySlug: string;
    sort?: string;
    category?: string;
    currentPage: number;
    isSale: boolean;
}) {
    const filterCategory = (categorySlug === "all" || categorySlug === "packs" || isSale) ? category : undefined;

    const { products, total, totalPages } = isSale
        ? await getSaleProducts(sort || "popular", category, currentPage)
        : await getProductsByCategory(categorySlug, sort || "popular", filterCategory, currentPage);

    const t = await getTranslations("Shop");

    return (
        <>
            {/* Filter & Count Row */}
            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-pink-50 pb-8 gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <label className="text-sm font-black text-flora-dark uppercase tracking-[0.2em] flex items-center gap-2">
                                {t("galleryTitle")} <Bow className="w-4 h-4 text-primary" />
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-white border border-pink-100 text-primary px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {t("treasuresCount", { count: total })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {(categorySlug === "all" || categorySlug === "packs" || isSale) && <CategoryToggle />}
                        <SortToggle />
                    </div>
                </div>
            </div>

            {/* Simplified Grid */}
            <div className="container mx-auto px-4 pb-24">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <p className="text-xl font-black text-flora-dark mb-2 text-center">
                            {category && ([...VALID_CATEGORIES, "all", "sale"] as string[]).includes(category)
                                ? t("noResults", { category: t(`titles.${category}`) })
                                : t("newCollection")}
                        </p>
                        <p className="text-gray-400 font-medium text-center">{t("checkBack")}</p>
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
        </>
    );
}

function GridSkeleton() {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-pink-50 pb-8 gap-8">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-32 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />
                ))}
            </div>
        </div>
    );
}

export async function CategoryPage({
    categorySlug,
    title,
    subtitle,
    searchParams,
    isSale = false
}: CategoryPageProps) {
    const { sort, category, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    const tNav = await getTranslations("Navigation");

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": tNav("home"),
                                "item": BASE_URL
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": title,
                                "item": `${BASE_URL}/${categorySlug}`
                            }
                        ]
                    })
                }}
            />
            <Navbar />

            <main className="flex-1 pt-32">
                <CollectionHeader title={title} subtitle={subtitle} isSale={isSale} />

                <Suspense fallback={<GridSkeleton />}>
                    <ProductGridWrapper
                        categorySlug={categorySlug}
                        sort={sort}
                        category={category}
                        currentPage={currentPage}
                        isSale={isSale}
                    />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
