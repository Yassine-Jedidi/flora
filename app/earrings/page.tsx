import { CategoryPage } from "@/components/shop/category-page";

export default async function EarringsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="earrings"
            title="Earrings"
            subtitle="Let your ears sparkle with every move"
            searchParams={searchParams}
        />
    );
}
