import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.all");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="all"
            title={t("titles.all")}
            subtitle={t("subtitles.all")}
            searchParams={searchParams}
        />
    );
}
