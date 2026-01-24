import { CategoryPage } from "@/components/shop/category-page";

export default async function PacksPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="packs"
            title="Packs"
            subtitle="Curated sets for every occasion"
            searchParams={searchParams}
        />
    );
}
