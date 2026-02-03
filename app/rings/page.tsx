import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export default async function RingsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="rings"
            title={t("titles.rings")}
            subtitle={t("subtitles.rings")}
            searchParams={searchParams}
        />
    );
}
