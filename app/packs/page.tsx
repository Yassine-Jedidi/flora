import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export default async function PacksPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="packs"
            title={t("titles.packs")}
            subtitle={t("subtitles.packs")}
            searchParams={searchParams}
        />
    );
}
