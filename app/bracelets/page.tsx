import { CategoryPage } from "@/components/shop/category-page";

export default async function BraceletsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="bracelets"
            title="Bracelets"
            subtitle="Wrap your wrists in elegance and charm"
            searchParams={searchParams}
        />
    );
}
