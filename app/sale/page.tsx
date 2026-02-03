import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";
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
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="sale"
            isSale={true}
            title={t("titles.sale")}
            subtitle={t("subtitles.sale")}
            searchParams={searchParams}
        />
    );
}
