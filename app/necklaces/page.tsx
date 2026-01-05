import { CategoryPage } from "@/components/shop/category-page";

export default async function NecklacesPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="necklaces"
            title="Necklaces"
            subtitle="Frame your beauty with our delicate chains"
            searchParams={searchParams}
        />
    );
}
