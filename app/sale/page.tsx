import { CategoryPage } from "@/components/shop/category-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sale Collection | Flora Accessories",
    description: "Discover our limited-time treasures with exclusive discounts",
};

export default async function SalePage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    return (
        <CategoryPage
            categorySlug="sale"
            isSale={true}
            title="Sale"
            subtitle="Grab your favorite treasures at a special price"
            searchParams={searchParams}
        />
    );
}
