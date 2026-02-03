import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.sale");
    return {
        title: t("title"),
        description: t("description")
    };
}

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
