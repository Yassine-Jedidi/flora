import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export default async function EarringsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="earrings"
            title={t("titles.earrings")}
            subtitle={t("subtitles.earrings")}
            searchParams={searchParams}
        />
    );
}
