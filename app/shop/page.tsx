import { CategoryPage } from "@/components/shop/category-page";

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="all"
            title="Shop All"
            subtitle="Explore our entire collection of exquisite adornments"
            searchParams={searchParams}
        />
    );
}
