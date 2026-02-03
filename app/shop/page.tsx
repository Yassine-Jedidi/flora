import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

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
